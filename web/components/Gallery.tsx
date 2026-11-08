import { GALLERY, GalleryEntry } from "../lib/gallery";
import { equationsLabel } from "../lib/variations";

type GalleryProps = {
    // opens the image in the editor with its settings
    onPick: (entry: GalleryEntry) => void;
};

// 24 images, so every row is full at two, three and four across
export default function Gallery({ onPick }: GalleryProps) {
    return (
        <section
            id="gallery"
            aria-label="gallery"
            className="mx-auto max-w-7xl scroll-mt-16 px-4 pt-24 sm:px-6"
        >
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Gallery</h2>
            <p className="mt-2 text-muted">Pick one to open it in the editor.</p>
            <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
                {GALLERY.map((entry) => (
                    <button
                        key={entry.src}
                        type="button"
                        onClick={() => onPick(entry)}
                        aria-label={`open ${equationsLabel(entry.params).join(" ")}, seed ${entry.params.seed} in the editor`}
                        className="group relative block overflow-hidden rounded-sm"
                    >
                        <img
                            src={entry.small}
                            alt=""
                            width={480}
                            height={480}
                            loading="lazy"
                            className="block aspect-square h-auto w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] group-active:brightness-90"
                            style={
                                entry.params.bg === "transparent"
                                    ? {
                                          background:
                                              "repeating-conic-gradient(var(--sam-line) 0 25%, transparent 0 50%) 0 0 / 16px 16px",
                                      }
                                    : undefined
                            }
                        />
                        <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                            open in editor
                        </span>
                    </button>
                ))}
            </div>
        </section>
    );
}
