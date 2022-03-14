import { useEffect, useState } from "react";
import GalleryImage from "./GalleryImage";

function getImages(): string[] {
    const NUM_IMAGE = 5;
    const BASE_PATH = "/images/samila";
    const images: string[] = new Array(NUM_IMAGE)
        .fill(null)
        .map((_, index) => BASE_PATH + index + ".png")
        .sort(() => Math.random() - 0.5); // shuffle array

    return images;
}

export default function Gallery() {
    const [images, setImages] = useState([""]);
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
                    <h2 className="flex items-center justify-center w-full mt-12">
                        <div className="text-2xl font-semibold"> Gallery</div>
                    </h2>

                    <div className="flex flex-row flex-wrap">
                        {images.map((image, index) => (
                            <div key={index}>
                                <GalleryImage image={image}></GalleryImage>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
