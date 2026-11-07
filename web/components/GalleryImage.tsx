import Image from "next/image";

type ImageProps = {
    image: string;
};

export default function GalleryImage({ image }: ImageProps) {
    return (
        <div className="flex items-center justify-center py-2">
            <Image
                src={image}
                alt="Samila generative art from the gallery"
                width={400}
                height={400}
                className="h-auto w-full"
            />
        </div>
    );
}
