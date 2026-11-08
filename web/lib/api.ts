import { GeneratorParams, Option } from "../interfaces";
import { DEFAULT_PARAMS } from "./presets";
import { fromEq, fromPair, MAX_EQ, MAX_FN } from "./variations";

export { EQUATIONS, MAX_EQ, PAIRS } from "./variations";
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
export const LINEWIDTH = { min: 0, max: 5 };
export const ROTATION = { min: 0, max: 360 };
export const SIZE = { min: 500, max: 4000, step: 500 };
// the grid reaches from -range to range; points per side are capped like the API caps them
export const GRID = { min: -12, max: 12, minStep: 0.002, maxStep: 1, maxPoints: 1_600_000 };
// a little under the cap, so rounding the step never tips a grid over it
export const MAX_SIDE = 1260;

// image shapes, as width / height
export const ASPECTS = [
    { label: "1:1", value: 1 },
    { label: "4:5", value: 4 / 5 },
    { label: "2:3", value: 2 / 3 },
    { label: "3:2", value: 3 / 2 },
    { label: "16:9", value: 16 / 9 },
];

export function isGradient(params: Pick<GeneratorParams, "cmap" | "colors">): boolean {
    return params.cmap !== null || params.colors !== null;
}

export function isHex(color: string): boolean {
    return /^#[0-9a-f]{6}$/i.test(color);
}

// the colour opposite another, as samila works out "complement"
export function complementHex(color: string): string {
    const n = 0xffffff ^ parseInt(color.replace(/^#/, ""), 16);
    return `#${n.toString(16).padStart(6, "0")}`;
}

// line and background as plain colours for drawing a swatch; transparent stays as is
export function resolvedColors(params: Pick<GeneratorParams, "color" | "bg">): {
    color: string;
    bg: string;
} {
    const { color, bg } = params;
    if (color === "complement" && isHex(bg)) {
        return { color: complementHex(bg), bg };
    }
    if (bg === "complement" && isHex(color)) {
        return { color, bg: complementHex(color) };
    }
    return { color, bg };
}

// pixel width and height for a long side and aspect; the short side stays at least the minimum
export function dimensions(size: number, aspect: number): { width: number; height: number } {
    const ratio = Math.max(aspect, 1 / aspect);
    const long = Math.min(SIZE.max, Math.max(size, Math.ceil(SIZE.min * ratio)));
    const short = Math.max(SIZE.min, Math.round(long / ratio));
    return aspect >= 1 ? { width: long, height: short } : { width: short, height: long };
}

// the size the image needs on this screen: its displayed width in device pixels,
// rounded up to a slider step and kept between 1000 and 2000
const IMAGE_CSS_WIDTH = 800;
export function autoSize(): number {
    const width = Math.min(window.innerWidth, IMAGE_CSS_WIDTH) * (window.devicePixelRatio || 1);
    const stepped = Math.ceil(width / SIZE.step) * SIZE.step;
    return Math.min(2000, Math.max(1000, stepped));
}

// rough PNG size; it varies with the image, so only shown as an estimate
export function estimateMB(width: number, height: number): string {
    const mb = (0.55 * (width * height)) / 1e6;
    return mb < 1 ? mb.toFixed(1) : String(Math.round(mb));
}

// the API takes hex colours without the leading '#', and the special names as they are
function apiColor(color: string): string {
    return color.replace(/^#/, "").toLowerCase();
}

// size for the API: square images by size, others by width and height
function setDimensions(query: URLSearchParams, size: number, aspect: number) {
    if (aspect === 1) {
        query.set("size", String(size));
        return;
    }
    const { width, height } = dimensions(size, aspect);
    query.delete("size");
    query.set("width", String(width));
    query.set("height", String(height));
}

// the query string for both the API and a shareable link; defaults of the newer options
// stay out, so links stay short and older ones read the same
export function paramsQuery(params: GeneratorParams): URLSearchParams {
    const d = DEFAULT_PARAMS;
    const query = new URLSearchParams(
        // samila's random equations, a numbered variation, or any other pair
        params.fseed !== null
            ? { fseed: String(params.fseed) }
            : params.eq !== null
              ? { eq: String(params.eq) }
              : { f1: String(params.f1), f2: String(params.f2) },
    );
    if (params.seed !== null) {
        query.set("seed", String(params.seed));
    }
    if (params.start !== d.start || params.stop !== d.stop) {
        query.set("start", String(params.start));
        query.set("stop", String(params.stop));
    }
    if (params.step !== d.step) {
        query.set("step", String(params.step));
    }
    query.set("proj", params.proj);
    query.set("mode", params.mode);
    query.set("color", apiColor(params.color));
    query.set("bg", apiColor(params.bg));
    if (params.cmap) {
        query.set("cmap", params.cmap);
    }
    if (params.colors) {
        query.set("colors", params.colors.map(apiColor).join(","));
    }
    query.set("marker", params.marker);
    query.set("spot", String(params.spot));
    query.set("alpha", String(params.alpha));
    if (params.linewidth !== d.linewidth) {
        query.set("linewidth", String(params.linewidth));
    }
    query.set("rotation", String(params.rotation));
    // auto stays out of links, so they suit whoever opens them; the shape always goes in
    if (params.size !== null) {
        setDimensions(query, params.size, params.aspect);
    } else if (params.aspect !== 1) {
        // presets by name, so the shape comes back exactly
        const preset = ASPECTS.find((a) => Math.abs(a.value - params.aspect) < 1e-9);
        query.set("aspect", preset?.label ?? String(Number(params.aspect.toFixed(4))));
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

function readSize(value: string | null): number | undefined {
    const n = readInt(value, SIZE.max);
    return n !== undefined && n >= SIZE.min ? n : undefined;
}

function parseHex(value: string | null, names: string[] = []): string | undefined {
    if (value !== null && names.includes(value)) {
        return value;
    }
    return value && /^[0-9a-f]{6}$/i.test(value) ? `#${value.toLowerCase()}` : undefined;
}

function parseColors(value: string | null): string[] | undefined {
    const colors = value?.split(",").map((c) => parseHex(c));
    return colors && colors.length >= 2 && colors.length <= 6 && colors.every(Boolean)
        ? (colors as string[])
        : undefined;
}

function parseChoice(value: string | null, choices: string[]): string | undefined {
    return value !== null && choices.includes(value) ? value : undefined;
}

// the long side and shape of a link's image, from size, or width and height
function parseShape(query: URLSearchParams): Pick<GeneratorParams, "size" | "aspect"> {
    const width = readSize(query.get("width"));
    const height = readSize(query.get("height"));
    if (width !== undefined && height !== undefined) {
        return { size: Math.max(width, height), aspect: width / height };
    }
    const named = ASPECTS.find((a) => a.label === query.get("aspect"))?.value;
    const aspect = named ?? readFloat(query.get("aspect"), { min: 0.25, max: 4 });
    return { size: readSize(query.get("size")) ?? null, aspect: aspect ?? 1 };
}

const QUERY_KEYS = [...Object.keys(DEFAULT_PARAMS), "width", "height"];

// params from a link, or null when it has none; invalid values fall back to defaults
export function parseQuery(query: URLSearchParams): GeneratorParams | null {
    if (![...query.keys()].some((key) => QUERY_KEYS.includes(key))) {
        return null;
    }
    const d = DEFAULT_PARAMS;
    const eq = readInt(query.get("eq"), MAX_EQ);
    const f1 = readInt(query.get("f1"), MAX_FN);
    const f2 = readInt(query.get("f2"), MAX_FN);
    const variation =
        eq !== undefined
            ? fromEq(eq)
            : f1 !== undefined && f2 !== undefined
              ? fromPair(f1, f2)
              : { eq: d.eq, f1: d.f1, f2: d.f2 };
    let start = readFloat(query.get("start"), GRID) ?? d.start;
    let stop = readFloat(query.get("stop"), GRID) ?? d.stop;
    if (start >= stop) {
        [start, stop] = [d.start, d.stop];
    }
    const minStep = Math.max(GRID.minStep, (stop - start) / MAX_SIDE);
    const step = readFloat(query.get("step"), { min: minStep, max: GRID.maxStep }) ?? d.step;
    let color = parseHex(query.get("color"), ["complement"]) ?? d.color;
    const bg = parseHex(query.get("bg"), ["transparent", "complement"]) ?? d.bg;
    if (color === "complement" && !isHex(bg)) {
        color = d.color;
    }
    const colors = parseColors(query.get("colors")) ?? null;
    const cmap = colors ? null : (query.get("cmap")?.match(/^[\w.-]{1,40}$/)?.[0] ?? d.cmap);
    return {
        ...variation,
        fseed: readInt(query.get("fseed"), MAX_SEED) ?? null,
        seed: readInt(query.get("seed"), MAX_SEED) ?? d.seed,
        start,
        stop,
        step: Math.max(step, minStep),
        proj: parseChoice(query.get("proj"), PROJECTIONS) ?? d.proj,
        mode:
            parseChoice(
                query.get("mode"),
                MODES.map((m) => m.value),
            ) ?? d.mode,
        color,
        bg: bg === "complement" && (colors || cmap) ? d.bg : bg,
        cmap,
        colors,
        marker:
            parseChoice(
                query.get("marker"),
                MARKERS.map((m) => m.value),
            ) ?? d.marker,
        spot: readFloat(query.get("spot"), SPOT) ?? d.spot,
        alpha: readFloat(query.get("alpha"), ALPHA) ?? d.alpha,
        linewidth: readFloat(query.get("linewidth"), LINEWIDTH) ?? d.linewidth,
        rotation: readFloat(query.get("rotation"), ROTATION) ?? d.rotation,
        ...parseShape(query),
    };
}

// the API query for rendering params at a long side
export function renderQuery(params: GeneratorParams, size: number): URLSearchParams {
    const query = paramsQuery(params);
    query.delete("aspect");
    setDimensions(query, size, params.aspect);
    return query;
}

// a shell command that fetches the same image from the API
export function curlCommand(origin: string, params: GeneratorParams, size: number): string {
    return `curl -o samila.png "${origin}/api/image?${renderQuery(params, size)}"`;
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
