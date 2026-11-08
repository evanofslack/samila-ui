import { GeneratorParams } from "../interfaces";
import entries from "./gallery.json";

// a gallery image and everything that made it; `just prerender` renders each entry
export type GalleryEntry = {
    params: GeneratorParams & { seed: number };
    // the editor's copy, 1400 px along the long side, and the grid's smaller one
    src: string;
    small: string;
};

export const GALLERY_SIZE = 1400;

export const GALLERY: GalleryEntry[] = (entries as (GeneratorParams & { seed: number })[]).map(
    (params, i) => ({
        params,
        src: `/images/gallery/g${i}.webp`,
        small: `/images/gallery/g${i}-sm.webp`,
    }),
);
