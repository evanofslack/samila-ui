import Image from "next/image";

type ImageProps = {
    img: string | null;
};

export default function SamilaImage({ img }: ImageProps) {
    return (
        <div className="relative flex flex-col items-center justify-center m-5  drop-shadow">
            {!img && <Image src={"/images/example.png"} alt="plot" width="800" height="800" />}
            {img && <Image src={img} alt="plot" width={800} height={800} />}
        </div>
    );
}