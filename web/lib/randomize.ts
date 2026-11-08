import { GeneratorParams } from "../interfaces";
import { CMAPS, MARKERS, MAX_EQ, MAX_SEED, MODES, PROJECTIONS } from "./api";
import { DEFAULT_PARAMS, PALETTES, SHAPES } from "./presets";
import { pick, pickWeighted, randomFloat, randomInt } from "./random";
import { fromEq } from "./variations";

type Params = Omit<GeneratorParams, "size" | "aspect">;

// hue 0..360, saturation and lightness 0..100, as #rrggbb
function hsl(h: number, s: number, l: number): string {
    const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
    const channel = (n: number) => {
        const k = (n + h / 30) % 12;
        const value = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
        return Math.round(value * 255)
            .toString(16)
            .padStart(2, "0");
    };
    return `#${channel(0)}${channel(8)}${channel(4)}`;
}

// a line and background with enough contrast to read
function generatedColors(): { color: string; bg: string } {
    const hue = randomFloat(0, 360);
    let dark: string;
    let light: string;
    if (Math.random() < 0.5) {
        // one hue, dark against light
        dark = hsl(hue, randomFloat(20, 60), randomFloat(6, 18));
        light = hsl(hue, randomFloat(20, 70), randomFloat(88, 97));
    } else {
        // contrasting hues
        const other = (hue + randomFloat(120, 240)) % 360;
        dark = hsl(hue, randomFloat(40, 80), randomFloat(8, 22));
        light = hsl(other, randomFloat(60, 95), randomFloat(60, 80));
    }
    return Math.random() < 0.5 ? { color: dark, bg: light } : { color: light, bg: dark };
}

export function randomSeed(): number {
    return randomInt(MAX_SEED + 1);
}

// mostly the curated palettes, sometimes a generated pair; gradient picks a colormap instead
export function randomColors(
    gradient = Math.random() < 0.1,
): Pick<Params, "color" | "bg" | "cmap" | "colors"> {
    const { color, bg } = Math.random() < 0.75 ? pick(PALETTES) : generatedColors();
    return { color, bg, cmap: gradient ? pick(CMAPS) : null, colors: null };
}

const DEFAULT_GRID = {
    start: DEFAULT_PARAMS.start,
    stop: DEFAULT_PARAMS.stop,
    step: DEFAULT_PARAMS.step,
};

// usually samila's grid; sometimes a wider or narrower one at the same density
function randomGrid(): Pick<Params, "start" | "stop" | "step"> {
    if (Math.random() < 0.85) {
        return DEFAULT_GRID;
    }
    const range = Number(randomFloat(1.5, 5).toFixed(2));
    return { start: -range, stop: range, step: Number(((2 * range) / 628).toFixed(5)) };
}

// the variation and how it's plotted; mostly from the curated shapes
export function randomShape(): Pick<
    Params,
    "eq" | "f1" | "f2" | "fseed" | "mode" | "proj" | "start" | "stop" | "step"
> {
    if (Math.random() < 0.55) {
        const { eq, mode, proj } = pick(SHAPES);
        return { ...fromEq(eq), fseed: null, mode, proj, ...DEFAULT_GRID };
    }
    const otherModes = MODES.map((m) => m.value).filter(
        (m) => m !== "f1_vs_f2" && m !== "f2_vs_f1",
    );
    const otherProjs = PROJECTIONS.filter((p) => p !== "rectilinear" && p !== "polar");
    return {
        ...fromEq(randomInt(MAX_EQ + 1)),
        // now and then, equations samila writes itself
        fseed: Math.random() < 0.3 ? randomSeed() : null,
        mode: pickWeighted(
            [
                ["f1_vs_f2", 0.45],
                ["f2_vs_f1", 0.4],
            ],
            otherModes,
        ),
        proj: pickWeighted(
            [
                ["rectilinear", 0.4],
                ["polar", 0.35],
            ],
            otherProjs,
        ),
        ...randomGrid(),
    };
}

export function randomPoints(): Pick<
    Params,
    "marker" | "spot" | "alpha" | "linewidth" | "rotation"
> {
    const otherMarkers = MARKERS.map((m) => m.value).filter((m) => m !== "point" && m !== "circle");
    const marker = pickWeighted(
        [
            ["point", 0.6],
            ["circle", 0.2],
        ],
        otherMarkers,
    );
    // points need a bigger spot than shaped markers to show
    const spot = marker === "point" ? randomFloat(0.2, 1.2) : randomFloat(0.02, 0.3);
    return {
        marker,
        spot: Number(spot.toPrecision(2)),
        alpha: Number(randomFloat(0.06, 0.22).toFixed(2)),
        // outlined markers sometimes get a finer or bolder line
        linewidth:
            marker !== "point" && Math.random() < 0.3
                ? Number(randomFloat(0.3, 3).toFixed(1))
                : DEFAULT_PARAMS.linewidth,
        rotation: Math.random() < 0.8 ? 0 : randomInt(24) * 15,
    };
}

// a curated shape with its seed in a curated palette most of the time, else anything goes
export function surpriseParams(): Params {
    if (Math.random() < 0.7) {
        const shape = pick(SHAPES);
        return {
            ...DEFAULT_PARAMS,
            ...shape,
            ...fromEq(shape.eq),
            ...randomColors(false),
        };
    }
    return { ...randomShape(), ...randomPoints(), ...randomColors(), seed: randomSeed() };
}
