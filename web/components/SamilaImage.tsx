import { useEffect, useState } from "react";
import Image from "next/image";
import { ActionIcon, Loader, Tooltip } from "@mantine/core";
import { FiCopy, FiDownload, FiLink } from "react-icons/fi";
import { GeneratedImage } from "../interfaces";
import { ApiError, autoSize, paramsQuery } from "../lib/api";
import { DEFAULT_IMAGE, DEFAULT_PARAMS } from "../lib/presets";
import { variationLabel } from "../lib/variations";
import CopyIcon from "./CopyIcon";

type ImageProps = {
    image: GeneratedImage | null;
    loading: boolean;
    elapsed: number;
    error: ApiError | null;
    onCancel: () => void;
};

function download(href: string, name: string) {
    const link = document.createElement("a");
    link.href = href;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// a rendered image is already a PNG in memory; the pre-rendered default is a webp,
// so its PNG comes from the API at the chosen size
function downloadImage(image: GeneratedImage | null) {
    if (image) {
        const name = variationLabel(image.params).replace(" × ", "-");
        download(image.url, `samila-${name}-${image.params.seed}-${image.size}.png`);
        return;
    }
    const size = DEFAULT_PARAMS.size ?? autoSize();
    const query = paramsQuery(DEFAULT_PARAMS);
    query.set("size", String(size));
    download(
        `/api/image?${query}`,
        `samila-${DEFAULT_PARAMS.eq}-${DEFAULT_PARAMS.seed}-${size}.png`,
    );
}

export default function SamilaImage({ image, loading, elapsed, error, onCancel }: ImageProps) {
    const shown = image?.params ?? DEFAULT_PARAMS;
    // the page's address, known only in the browser
    const [page, setPage] = useState("");

    useEffect(() => {
        setPage(`${window.location.origin}${window.location.pathname}`);
    }, []);

    return (
        // on wide screens the square never grows taller than the window below the header
        <div className="mx-auto flex w-full max-w-[min(100%,calc(100svh-150px))] min-w-0 flex-col">
            <div className="relative aspect-square w-full overflow-hidden rounded-md border border-line bg-surface">
                <Image
                    src={image?.url ?? DEFAULT_IMAGE}
                    alt={`Samila generative art, variation ${variationLabel(shown)}, seed ${shown.seed}`}
                    width={1400}
                    height={1400}
                    className={`h-auto w-full transition-opacity duration-300 ${loading ? "opacity-75" : ""}`}
                    priority
                />
                {loading && (
                    <>
                        <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-ink/10">
                            <div className="sam-progress h-full w-1/3 bg-ink" />
                        </div>
                        <div
                            role="status"
                            className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-line bg-surface/90 py-1 pr-1 pl-3 text-xs shadow-sm backdrop-blur"
                        >
                            <Loader size={12} />
                            <span className="tabular-nums">rendering · {elapsed}s</span>
                            <button
                                type="button"
                                onClick={onCancel}
                                className="rounded-full px-2 py-0.5 text-muted transition-colors hover:bg-ink/10 hover:text-ink"
                            >
                                cancel
                            </button>
                        </div>
                    </>
                )}
            </div>
            <div className="flex min-h-10 flex-row flex-wrap items-center justify-between gap-x-2 pt-1">
                <div className="flex flex-row items-center gap-1 text-sm text-muted">
                    <span>
                        variation{" "}
                        <span className="font-mono text-ink">{variationLabel(shown)}</span>
                        {" · "}
                        seed <span className="font-mono text-ink">{shown.seed}</span>
                    </span>
                    {shown.seed !== null && (
                        <CopyIcon
                            value={String(shown.seed)}
                            label="copy seed"
                            icon={<FiCopy size="0.9rem" />}
                        />
                    )}
                </div>
                <div className="flex flex-row items-center">
                    <CopyIcon
                        value={`${page}?${paramsQuery(shown)}`}
                        label="copy link"
                        icon={<FiLink size="1.05rem" />}
                    />
                    <Tooltip label="download PNG" withArrow>
                        <ActionIcon
                            variant="subtle"
                            aria-label="download image"
                            onClick={() => downloadImage(image)}
                        >
                            <FiDownload size="1.05rem" />
                        </ActionIcon>
                    </Tooltip>
                </div>
            </div>
            {error && (
                <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                    {error.title}: {error.message}
                </p>
            )}
        </div>
    );
}
