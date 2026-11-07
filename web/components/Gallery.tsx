import { useEffect, useState } from "react";
import { Carousel } from "@mantine/carousel";
import GalleryImage from "./GalleryImage";
import { shuffle } from "../lib/random";

const NUM_IMAGES = 18;

// the gallery images in a random order, two to a slide
function getSlides(): [string, string][] {
    const images = shuffle(Array.from({ length: NUM_IMAGES }, (_, i) => `/images/samila${i}.webp`));
    const slides: [string, string][] = [];
    for (let i = 0; i + 1 < images.length; i += 2) {
        slides.push([images[i], images[i + 1]]);
    }
    return slides;
}

export default function Gallery() {
    // shuffled after mount, so the server and first client render agree
    const [slides, setSlides] = useState<[string, string][] | null>(null);

    useEffect(() => {
        setSlides(getSlides());
    }, []);

    return (
        <section
            id="gallery"
            aria-label="gallery"
            className="mx-auto max-w-7xl scroll-mt-16 px-4 pt-16 sm:px-6"
        >
            <div>
                {slides && (
                    <Carousel
                        slideSize={{ base: "50%", sm: "33.333%", lg: "25%" }}
                        emblaOptions={{ loop: true, align: "start" }}
                        previousControlProps={{ "aria-label": "previous images" }}
                        nextControlProps={{ "aria-label": "next images" }}
                    >
                        {slides.map(([top, bottom]) => (
                            <Carousel.Slide key={top} className="p-2">
                                <GalleryImage image={top} />
                                <GalleryImage image={bottom} />
                            </Carousel.Slide>
                        ))}
                    </Carousel>
                )}
            </div>
        </section>
    );
}
