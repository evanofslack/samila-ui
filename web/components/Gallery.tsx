import { useState } from "react";
import Image from "next/image";
import { ActionIcon, Modal } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const IMAGES = Array.from({ length: 18 }, (_, i) => `/images/samila${i}.webp`);

export default function Gallery() {
    // the image open in the lightbox
    const [open, setOpen] = useState<number | null>(null);

    const step = (delta: number) =>
        setOpen((i) => (i === null ? i : (i + delta + IMAGES.length) % IMAGES.length));

    useHotkeys([
        ["ArrowLeft", () => step(-1)],
        ["ArrowRight", () => step(1)],
    ]);

    return (
        <section
            id="gallery"
            aria-label="gallery"
            className="mx-auto max-w-7xl scroll-mt-16 px-4 pt-24 sm:px-6"
        >
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Gallery</h2>
            <p className="mt-2 text-muted">A few favourites made with samila.</p>
            <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
                {IMAGES.map((src, i) => (
                    <button
                        key={src}
                        type="button"
                        onClick={() => setOpen(i)}
                        aria-label={`open gallery image ${i + 1}`}
                        className="group overflow-hidden rounded-sm"
                    >
                        <Image
                            src={src}
                            alt=""
                            width={400}
                            height={400}
                            loading="lazy"
                            className="h-auto w-full transition-transform duration-300 group-hover:scale-[1.02] group-active:brightness-90"
                        />
                    </button>
                ))}
            </div>

            <Modal
                opened={open !== null}
                onClose={() => setOpen(null)}
                size="min(90vw, calc(100svh - 120px))"
                centered
                padding={0}
                withCloseButton={false}
                classNames={{ content: "overflow-hidden bg-transparent shadow-none" }}
                overlayProps={{ backgroundOpacity: 0.8, blur: 4 }}
            >
                {open !== null && (
                    <div className="relative">
                        <Image
                            src={IMAGES[open]}
                            alt={`Samila gallery image ${open + 1}`}
                            width={800}
                            height={800}
                            className="h-auto w-full rounded-sm"
                        />
                        <ActionIcon
                            variant="default"
                            radius="xl"
                            size="lg"
                            aria-label="previous image"
                            onClick={() => step(-1)}
                            className="absolute top-1/2 left-2 -translate-y-1/2 opacity-80 hover:opacity-100"
                        >
                            <FiChevronLeft />
                        </ActionIcon>
                        <ActionIcon
                            variant="default"
                            radius="xl"
                            size="lg"
                            aria-label="next image"
                            onClick={() => step(1)}
                            className="absolute top-1/2 right-2 -translate-y-1/2 opacity-80 hover:opacity-100"
                        >
                            <FiChevronRight />
                        </ActionIcon>
                        <p className="absolute right-3 bottom-2 rounded-full bg-black/50 px-2 font-mono text-xs text-white">
                            {open + 1} / {IMAGES.length}
                        </p>
                    </div>
                )}
            </Modal>
        </section>
    );
}
