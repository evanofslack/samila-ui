import { GeneratorParams } from "../interfaces";
import { CMAPS, MARKERS, MAX_EQ, MAX_SEED, MODES, PROJECTIONS } from "./api";
import { pick, pickWeighted, randomFloat, randomInt } from "./random";

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
function randomColors(): { color: string; bg: string } {
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

export function randomParams(): Omit<GeneratorParams, "size"> {
    const otherMarkers = MARKERS.map((m) => m.value).filter((m) => m !== "point" && m !== "circle");
    const otherModes = MODES.map((m) => m.value).filter(
        (m) => m !== "f1_vs_f2" && m !== "f2_vs_f1",
    );
    const otherProjs = PROJECTIONS.filter((p) => p !== "rectilinear" && p !== "polar");
    const marker = pickWeighted(
        [
            ["point", 0.5],
            ["circle", 0.3],
        ],
        otherMarkers,
    );
    // points need a bigger spot than shaped markers to show
    const spot = marker === "point" ? randomFloat(0.1, 1.5) : randomFloat(0.02, 0.3);
    return {
        eq: randomInt(MAX_EQ + 1),
        seed: randomInt(MAX_SEED + 1),
        proj: pickWeighted(
            [
                ["rectilinear", 0.4],
                ["polar", 0.35],
            ],
            otherProjs,
        ),
        mode: pickWeighted(
            [
                ["f1_vs_f2", 0.45],
                ["f2_vs_f1", 0.4],
            ],
            otherModes,
        ),
        ...randomColors(),
        cmap: Math.random() < 0.25 ? pick(CMAPS) : null,
        marker,
        spot: Number(spot.toPrecision(2)),
        alpha: Number(randomFloat(0.05, 0.3).toFixed(2)),
        rotation: Math.random() < 0.7 ? 0 : randomInt(24) * 15,
    };
}
