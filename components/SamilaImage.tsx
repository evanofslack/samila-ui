import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
    AiOutlineDownload,
    AiOutlineSave,
    AiOutlineLike,
    AiFillLike,
    AiFillSave,
} from "react-icons/ai";
import { ActionIcon, Tooltip } from "@mantine/core";

type ImageProps = {
    img: string | null;
};

function downloadImage(image: string) {
    const link = document.createElement("a");
    link.href = image;
    link.download = "samila";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function getRandomInt(max: number): string {
    return Math.floor(Math.random() * max).toString();
}

function getRandomImage(): string {
    const BASE_PATH = "/images/example_";
    return BASE_PATH + getRandomInt(4) + ".png";
}

export default function SamilaImage({ img }: ImageProps) {
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);

    const [placeholder, setPlaceholder] = useState(getRandomImage);
    useEffect(() => {
        const i = getRandomImage();
        setPlaceholder(i);
        console.log(i);
    }, []);

    return (
        <div className="relative flex flex-col items-center justify-center m-5 lg:mt-8 drop-shadow-sm">
            {!img && <Image src={placeholder} alt="plot" width="700" height="700" />}
            {img && <Image src={img} alt="plot" width={700} height={700} />}

            <div className="w-full flex flex-row justify-end pt-1 px-3">
                <Tooltip label="like" withArrow className="px-1">
                    <ActionIcon onClick={() => setLiked(!liked)}>
                        {liked ? <AiFillLike size="1.4rem" /> : <AiOutlineLike size="1.4rem" />}
                    </ActionIcon>
                </Tooltip>
                <Tooltip label="save" withArrow className="px-1">
                    <ActionIcon onClick={() => setSaved(!saved)}>
                        {saved ? <AiFillSave size="1.4rem" /> : <AiOutlineSave size="1.4rem" />}
                    </ActionIcon>
                </Tooltip>
                <Tooltip label="download" withArrow className="px-1">
                    <ActionIcon onClick={() => downloadImage(img ? img : placeholder)}>
                        <AiOutlineDownload size="1.4rem" />
                    </ActionIcon>
                </Tooltip>
            </div>
        </div>
    );
}
