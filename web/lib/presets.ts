import { GeneratorParams } from "../interfaces";
import presets from "./presets.json";
import { fromEq } from "./variations";

// hand-picked in presets.json; the default is also pre-rendered as /images/default.webp
// by `just prerender`, so the first image needs no request
export const DEFAULT_PARAMS: GeneratorParams = {
    ...presets.default,
    ...fromEq(presets.default.eq),
    size: null,
};
export const DEFAULT_IMAGE = "/images/default.webp";

export type Shape = Pick<
    GeneratorParams,
    "proj" | "mode" | "marker" | "spot" | "alpha" | "rotation"
> & {
    eq: number;
    seed: number;
};

export type Palette = { name: string; color: string; bg: string };

export const SHAPES: Shape[] = presets.shapes;
export const PALETTES: Palette[] = presets.palettes;
