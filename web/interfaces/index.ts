export type GeneratorParams = {
    // the variation, or null for a pair of equations that isn't one
    eq: number | null;
    // the two equations; with eq set they're always PAIRS[eq]
    f1: number;
    f2: number;
    // when set, samila writes two random equations from it and eq, f1 and f2 wait unused
    fseed: number | null;
    seed: number | null;
    // the grid of starting points along x and y, and its spacing
    start: number;
    stop: number;
    step: number;
    proj: string;
    mode: string;
    // a hex colour, or "complement" of the other one; bg may also be "transparent"
    color: string;
    bg: string;
    // a gradient: a matplotlib colormap, or custom colours; at most one is set
    cmap: string | null;
    colors: string[] | null;
    marker: string;
    spot: number;
    alpha: number;
    linewidth: number;
    rotation: number;
    // the image's long side in pixels; null picks one to suit the screen
    size: number | null;
    // width / height
    aspect: number;
};

// a rendered image and the params that made it, with the seed and eq the API used
export type GeneratedImage = {
    url: string;
    params: GeneratorParams & { seed: number };
    // the long side actually rendered, which auto resolves to a number
    size: number;
};

export type Option = {
    value: string;
    label: string;
};
