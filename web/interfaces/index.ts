export type GeneratorParams = {
    eq: number;
    seed: number | null;
    proj: string;
    mode: string;
    color: string;
    bg: string;
    cmap: string | null;
    marker: string;
    spot: number;
    alpha: number;
    rotation: number;
    // image width and height in pixels; null picks one to suit the screen
    size: number | null;
};

// a rendered image and the params that made it, with the seed and eq the API used
export type GeneratedImage = {
    url: string;
    params: GeneratorParams & { seed: number };
    // the size actually rendered, which auto resolves to a number
    size: number;
};

export type Option = {
    value: string;
    label: string;
};
