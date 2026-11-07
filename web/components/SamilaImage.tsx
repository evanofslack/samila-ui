import { useEffect, useState } from "react";
import Image from "next/image";
import { ActionIcon, LoadingOverlay, Tooltip } from "@mantine/core";
import { FiCopy, FiDownload, FiLink } from "react-icons/fi";
import { GeneratedImage } from "../interfaces";
import { paramsQuery } from "../lib/api";
import { randomInt } from "../lib/random";
import CopyIcon from "./CopyIcon";

const NUM_EXAMPLES = 8;

type ImageProps = {
    image: GeneratedImage | null;
    loading: boolean;
};

function downloadImage(image: GeneratedImage) {
    const link = document.createElement("a");
    link.href = image.url;
    link.download = `samila-${image.params.eq}-${image.params.seed}-${image.size}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function shareLink(image: GeneratedImage): string {
    const { origin, pathname } = window.location;
    return `${origin}${pathname}?${paramsQuery(image.params)}`;
}

export default function SamilaImage({ image, loading }: ImageProps) {
    // picked after mount, so the server and first client render agree
    const [placeholder, setPlaceholder] = useState<string | null>(null);

    useEffect(() => {
        setPlaceholder(`/images/example_${randomInt(NUM_EXAMPLES)}.webp`);
    }, []);

    const src = image?.url ?? placeholder;

    return (
        <div className="flex w-full max-w-[700px] min-w-0 flex-col py-4 lg:mt-4">
            <div className="relative aspect-square w-full bg-white drop-shadow-sm">
                <LoadingOverlay
                    visible={loading}
                    zIndex={10}
                    overlayProps={{ blur: 1, backgroundOpacity: 0.4 }}
                    loaderProps={{ color: "dark" }}
                />
                {src && (
                    <Image
                        src={src}
                        alt={
                            image
                                ? `Samila generative art, variation ${image.params.eq}, seed ${image.params.seed}`
                                : "An example of Samila generative art"
                        }
                        width={700}
                        height={700}
                        className="h-auto w-full"
                        priority
                    />
                )}
            </div>
            <div className="flex min-h-10 flex-row flex-wrap items-center justify-between gap-x-2 pt-1 pl-1">
                <div className="flex flex-row items-center gap-1 text-sm font-light">
                    {image && (
                        <>
                            <span>
                                variation <span className="tabular-nums">{image.params.eq}</span>
                                {" · "}
                                seed <span className="tabular-nums">{image.params.seed}</span>
                            </span>
                            <CopyIcon
                                value={String(image.params.seed)}
                                label="copy seed"
                                icon={<FiCopy size="1rem" />}
                            />
                        </>
                    )}
                </div>
                <div className="flex flex-row items-center">
                    {image && (
                        <CopyIcon
                            value={shareLink(image)}
                            label="copy link"
                            icon={<FiLink size="1.1rem" />}
                        />
                    )}
                    <Tooltip label="download" withArrow>
                        <ActionIcon
                            variant="subtle"
                            color="dark"
                            aria-label="download image"
                            disabled={!image}
                            onClick={() => image && downloadImage(image)}
                        >
                            <FiDownload size="1.1rem" />
                        </ActionIcon>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}
