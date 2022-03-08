import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type ImageProps = {
    img: string | null;
};

function getRandomInt(max: number): string {
    return Math.floor(Math.random() * max).toString();
}

function getRandomImage(): string {
    const BASE_PATH = "/images/example_";
    return BASE_PATH + getRandomInt(4) + ".png";
}

export default function SamilaImage({ img }: ImageProps) {
    const [placeholder, setPlaceholder] = useState(getRandomImage);
    useEffect(() => {
        const i = getRandomImage();
        setPlaceholder(i);
        console.log(i);
    }, []);

    return (
        <div className="relative flex flex-col items-center justify-center m-5 lg:mt-8 drop-shadow">
            {!img && <Image src={placeholder} alt="plot" width="700" height="700" />}
            {img && <Image src={img} alt="plot" width={700} height={700} />}
        </div>
    );
}
