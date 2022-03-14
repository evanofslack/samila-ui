import Image from "next/image";

type imageProps = {
    image: string;
};

export default function GalleryImage({ image }: imageProps) {
    return (
        <div className="flex items-center justify-center p-2 py-4 ">
            <Image src={image} width={400} height={400} />
            {/* <Image src={image} width={200} height={200} /> */}
        </div>
    );
}
