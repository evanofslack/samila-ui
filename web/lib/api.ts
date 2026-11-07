import { GeneratorParams, Option } from "../interfaces";

export const MAX_EQ = 54;
export const MAX_SEED = 1048576;

export const PROJECTIONS = ["rectilinear", "polar", "hammer", "aitoff", "lambert", "mollweide"];

export const MODES: Option[] = [
    "f1_vs_f2",
    "f2_vs_f1",
    "f1_vs_index",
    "f2_vs_index",
    "index_vs_f1",
    "index_vs_f2",
    "f1_vs_x1",
    "f2_vs_x1",
    "f1_vs_x2",
    "f2_vs_x2",
    "x1_vs_f1",
    "x1_vs_f2",
    "x2_vs_f1",
    "x2_vs_f2",
    "f1f2_vs_f1",
    "f1f2_vs_f2",
    "f1_vs_f1f2",
    "f2_vs_f1f2",
].map((value) => ({
    value,
    label: value.replace(/_vs_/, " vs ").replace(/f1f2/g, "f1·f2"),
}));

export const CMAPS = [
    "viridis",
    "plasma",
    "inferno",
    "magma",
    "cividis",
    "twilight",
    "turbo",
    "cool",
    "spring",
    "ocean",
];

const MARKER_LABELS: Record<string, string> = {
    point: "point",
    pixel: "pixel",
    circle: "circle",
    triangle_down: "triangle down",
    triangle_up: "triangle up",
    triangle_left: "triangle left",
    triangle_right: "triangle right",
    tri_down: "tri down",
    tri_up: "tri up",
    tri_left: "tri left",
    tri_right: "tri right",
    octagon: "octagon",
    square: "square",
    pentagon: "pentagon",
    plus: "plus",
    plus_filled: "plus (filled)",
    star: "star",
    hexagon_vertical: "hexagon (vertical)",
    hexagon_horizontal: "hexagon (horizontal)",
    x: "x",
    x_filled: "x (filled)",
    diamond: "diamond",
    diamon_thin: "thin diamond",
    vline: "vertical line",
    hline: "horizontal line",
};

export const MARKERS: Option[] = Object.entries(MARKER_LABELS).map(([value, label]) => ({
    value,
    label,
}));

export const SPOT = { min: 0.01, max: 10 };
export const ALPHA = { min: 0.01, max: 1 };
export const ROTATION = { min: 0, max: 360 };

export const DEFAULT_PARAMS: GeneratorParams = {
    eq: 1,
    seed: null,
    proj: "rectilinear",
    mode: "f1_vs_f2",
    color: "#000000",
    bg: "#ffffff",
    cmap: null,
    marker: "point",
    spot: 0.5,
    alpha: 0.1,
    rotation: 0,
};

// the API takes hex colours without the leading '#'
function hex(color: string): string {
    return color.replace(/^#/, "").toLowerCase();
}

// the query string for both the API and a shareable link
export function paramsQuery(params: GeneratorParams): URLSearchParams {
    const query = new URLSearchParams({
        eq: String(params.eq),
        proj: params.proj,
        mode: params.mode,
        color: hex(params.color),
        bg: hex(params.bg),
        marker: params.marker,
        spot: String(params.spot),
        alpha: String(params.alpha),
        rotation: String(params.rotation),
    });
    if (params.seed !== null) {
        query.set("seed", String(params.seed));
    }
    if (params.cmap) {
        query.set("cmap", params.cmap);
    }
    return query;
}

function readInt(value: string | null, max: number): number | undefined {
    if (value === null || !/^\d+$/.test(value)) {
        return undefined;
    }
    const n = Number(value);
    return n <= max ? n : undefined;
}

function readFloat(value: string | null, range: { min: number; max: number }) {
    if (value === null || value.trim() === "") {
        return undefined;
    }
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(range.max, Math.max(range.min, n)) : undefined;
}

function parseHex(value: string | null): string | undefined {
    return value && /^[0-9a-f]{6}$/i.test(value) ? `#${value.toLowerCase()}` : undefined;
}

function parseChoice(value: string | null, choices: string[]): string | undefined {
    return value !== null && choices.includes(value) ? value : undefined;
}

// params from a link, or null when it has none; invalid values fall back to defaults
export function parseQuery(query: URLSearchParams): GeneratorParams | null {
    const keys = Object.keys(DEFAULT_PARAMS);
    if (![...query.keys()].some((key) => keys.includes(key))) {
        return null;
    }
    const d = DEFAULT_PARAMS;
    return {
        eq: readInt(query.get("eq"), MAX_EQ) ?? d.eq,
        seed: readInt(query.get("seed"), MAX_SEED) ?? d.seed,
        proj: parseChoice(query.get("proj"), PROJECTIONS) ?? d.proj,
        mode:
            parseChoice(
                query.get("mode"),
                MODES.map((m) => m.value),
            ) ?? d.mode,
        color: parseHex(query.get("color")) ?? d.color,
        bg: parseHex(query.get("bg")) ?? d.bg,
        cmap: parseChoice(query.get("cmap"), CMAPS) ?? d.cmap,
        marker:
            parseChoice(
                query.get("marker"),
                MARKERS.map((m) => m.value),
            ) ?? d.marker,
        spot: readFloat(query.get("spot"), SPOT) ?? d.spot,
        alpha: readFloat(query.get("alpha"), ALPHA) ?? d.alpha,
        rotation: readFloat(query.get("rotation"), ROTATION) ?? d.rotation,
    };
}

export type ApiError = {
    title: string;
    message: string;
};

export const NETWORK_ERROR: ApiError = {
    title: "can't reach server",
    message: "check your connection and try again",
};

async function detail(resp: Response): Promise<string | null> {
    try {
        const body = await resp.json();
        if (typeof body.detail === "string") {
            return body.detail;
        }
        if (Array.isArray(body.detail)) {
            return body.detail.map((d: { msg?: string }) => d.msg ?? String(d)).join("; ");
        }
    } catch {
        // not JSON
    }
    return null;
}

// what to tell the viewer about a failed response
export async function apiError(resp: Response): Promise<ApiError> {
    switch (resp.status) {
        case 422:
            return {
                title: "invalid options",
                message: (await detail(resp)) ?? "check the options",
            };
        case 429: {
            const wait = Number(resp.headers.get("Retry-After"));
            const after = Number.isFinite(wait) && wait > 0 ? `${Math.ceil(wait)} s` : "a moment";
            return { title: "slow down", message: `try again in ${after}` };
        }
        case 502:
            return NETWORK_ERROR;
        case 503:
            return { title: "server busy", message: "too many images rendering, try again soon" };
        case 504:
            return { title: "took too long", message: "try simpler options, like a smaller spot" };
        default:
            return {
                title: "something went wrong",
                message: (await detail(resp)) ?? `the server returned ${resp.status}`,
            };
    }
}
