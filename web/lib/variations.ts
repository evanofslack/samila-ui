import { GeneratorParams } from "../interfaces";
import equations from "./equations.json";

// written by `just prerender` from api/app/equations.py
export const EQUATIONS = equations.functions;
export const PAIRS = equations.pairs as [number, number][];
export const MAX_EQ = PAIRS.length - 1;
export const MAX_FN = EQUATIONS.length - 1;

type Variation = Pick<GeneratorParams, "eq" | "f1" | "f2">;

// the variation number of an equation pair, or null when it isn't one
export function pairIndex(f1: number, f2: number): number | null {
    const i = PAIRS.findIndex(([a, b]) => a === f1 && b === f2);
    return i === -1 ? null : i;
}

export function fromEq(eq: number): Variation {
    const [f1, f2] = PAIRS[eq];
    return { eq, f1, f2 };
}

export function fromPair(f1: number, f2: number): Variation {
    return { eq: pairIndex(f1, f2), f1, f2 };
}

// "82" for a numbered variation, "3 × 12" for a pair chosen by hand
export function variationLabel({ eq, f1, f2 }: Variation): string {
    return eq !== null ? String(eq) : `${f1} × ${f2}`;
}

// what made the equations, as a label and its value: "variation", "82" or "random", "5120"
export function equationsLabel(
    params: Variation & Pick<GeneratorParams, "fseed">,
): [string, string] {
    return params.fseed !== null
        ? ["random", String(params.fseed)]
        : ["variation", variationLabel(params)];
}

export function thumbnail(eq: number): string {
    return `/images/thumbs/v${eq}.webp`;
}
