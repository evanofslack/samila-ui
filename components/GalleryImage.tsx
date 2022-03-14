import Image from "next/image";

type imageProps = {
    image: string;
};

export default function GalleryImage({ image }: imageProps) {
    return (
        <div className="flex items-center justify-center p-4">
            <Image src={image} width={150} height={150} />
            <p>{image}</p>
        </div>
    );
}
