import { useEffect, useState } from "react";
import GalleryImage from "./GalleryImage";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const responsive = {
    desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: 4,
        slidesToSlide: 1, // optional, default to 1.
    },
    tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: 3,
        slidesToSlide: 1, // optional, default to 1.
    },
    mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 2,
        slidesToSlide: 1, // optional, default to 1.
    },
};

function getImages(): [string, string][] {
    const NUM_IMAGE = 6;
    const BASE_PATH = "/images/samila";

    const images: [string, string][] = new Array(NUM_IMAGE / 2);
    for (var i = 0; i < images.length; i++) {
        images[i] = [BASE_PATH + i * 2 + ".png", BASE_PATH + (i * 2 + 1) + ".png"];
    }

    // const images: string[] = new Array(NUM_IMAGE/2)
    //     .fill(null)
    //     .map((_, index) => (BASE_PATH + index + ".png", BASE_PATH + index))
    //     .sort(() => Math.random() - 0.5); // shuffle array

    return images;
}

export default function Gallery() {
    const [images, setImages] = useState([["", ""]]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(true);
        setImages(getImages());
        setLoading(false);
    }, []);

    return (
        <div>
            {!loading && (
                <div>
                    <h2 className="flex items-center justify-center w-full mt-14 md:mt-18 mb-2 md:mb-4">
                        <div className="text-2xl font-semibold"> Gallery</div>
                    </h2>

                    <div className="flex items-center justify-center w-full">
                        <Carousel
                            className="bg-white w-11/12"
                            responsive={responsive}
                            infinite={true}
                            autoPlay={true}
                            shouldResetAutoplay={false}
                        >
                            {images.map((image, index) => (
                                <div key={index}>
                                    {/* <p>{image[0]}</p>
                                    <p>{image[1]}</p> */}
                                    <GalleryImage image={image[0]}></GalleryImage>
                                    <GalleryImage image={image[1]}></GalleryImage>
                                </div>
                            ))}
                        </Carousel>
                    </div>
                </div>
            )}
        </div>
    );
}
