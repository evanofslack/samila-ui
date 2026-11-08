import { GeneratorParams } from "../interfaces";
import { CMAPS, MARKERS, MAX_EQ, MAX_SEED, MODES, PROJECTIONS } from "./api";
import { PALETTES, SHAPES } from "./presets";
import { pick, pickWeighted, randomFloat, randomInt } from "./random";
import { fromEq } from "./variations";

type Params = Omit<GeneratorParams, "size">;

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

// mostly the curated palettes, sometimes a generated pair
export function randomColors(): Pick<Params, "color" | "bg" | "cmap"> {
    const { color, bg } = Math.random() < 0.75 ? pick(PALETTES) : generatedColors();
    return { color, bg, cmap: Math.random() < 0.1 ? pick(CMAPS) : null };
}

// the variation and how it's plotted; mostly from the curated shapes
export function randomShape(): Pick<Params, "eq" | "f1" | "f2" | "mode" | "proj"> {
    if (Math.random() < 0.6) {
        const { eq, mode, proj } = pick(SHAPES);
        return { ...fromEq(eq), mode, proj };
    }
    const otherModes = MODES.map((m) => m.value).filter(
        (m) => m !== "f1_vs_f2" && m !== "f2_vs_f1",
    );
    const otherProjs = PROJECTIONS.filter((p) => p !== "rectilinear" && p !== "polar");
    return {
        ...fromEq(randomInt(MAX_EQ + 1)),
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
    };
}

export function randomPoints(): Pick<Params, "marker" | "spot" | "alpha" | "rotation"> {
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
        rotation: Math.random() < 0.8 ? 0 : randomInt(24) * 15,
    };
}

// a curated shape with its seed in a curated palette most of the time, else anything goes
export function surpriseParams(): Params {
    if (Math.random() < 0.7) {
        const shape = pick(SHAPES);
        return { ...shape, ...fromEq(shape.eq), ...randomColors(), cmap: null };
    }
    return { ...randomShape(), ...randomPoints(), ...randomColors(), seed: randomSeed() };
}
