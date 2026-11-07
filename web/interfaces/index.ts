export type GeneratorParams = {
    eq: number;
    seed: number | null;
    proj: string;
    color: string;
    bg: string;
    spot: number;
};

export type GeneratedImage = {
    url: string;
    eq: number;
    seed: number;
};
