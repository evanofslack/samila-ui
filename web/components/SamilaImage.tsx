import { useEffect, useState } from "react";
import Image from "next/image";
import { AiOutlineDownload } from "react-icons/ai";
import { ActionIcon, Tooltip } from "@mantine/core";
import { GeneratedImage } from "../interfaces";
import { randomInt } from "../lib/random";

const NUM_EXAMPLES = 8;

type ImageProps = {
    image: GeneratedImage | null;
};

function downloadImage(image: GeneratedImage) {
    const link = document.createElement("a");
    link.href = image.url;
    link.download = `samila-${image.eq}-${image.seed}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export default function SamilaImage({ image }: ImageProps) {
    // picked after mount, so the server and first client render agree
    const [placeholder, setPlaceholder] = useState<string | null>(null);

    useEffect(() => {
        setPlaceholder(`/images/example_${randomInt(NUM_EXAMPLES)}.webp`);
    }, []);

    const src = image?.url ?? placeholder;

    return (
        <div className="m-5 mb-2 flex w-full max-w-[700px] flex-col items-center justify-center drop-shadow-sm lg:mt-8">
            <div className="aspect-square w-full bg-white">
                {src && (
                    <Image
                        src={src}
                        alt={
                            image
                                ? `Samila generative art, variation ${image.eq}, seed ${image.seed}`
                                : "An example of Samila generative art"
                        }
                        width={700}
                        height={700}
                        className="h-auto w-full"
                        priority
                    />
                )}
            </div>
            <div className="flex w-full flex-row justify-end px-3 pt-1">
                <Tooltip label="download" withArrow>
                    <ActionIcon
                        variant="subtle"
                        color="dark"
                        aria-label="download image"
                        disabled={!image}
                        onClick={() => image && downloadImage(image)}
                    >
                        <AiOutlineDownload size="1.3rem" />
                    </ActionIcon>
                </Tooltip>
            </div>
        </div>
    );
}
