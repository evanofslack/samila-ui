import { useEffect, useState } from "react";
import Image from "next/image";
import { ActionIcon, Loader, Tooltip } from "@mantine/core";
import { FiCopy, FiDownload, FiLink, FiTerminal } from "react-icons/fi";
import { GeneratedImage } from "../interfaces";
import { ApiError, autoSize, curlCommand, paramsQuery, renderQuery } from "../lib/api";
import { DEFAULT_IMAGE, DEFAULT_PARAMS } from "../lib/presets";
import { equationsLabel } from "../lib/variations";
import CopyIcon from "./CopyIcon";

type ImageProps = {
    image: GeneratedImage | null;
    loading: boolean;
    elapsed: number;
    error: ApiError | null;
    onCancel: () => void;
    // the controls no longer match the image
    stale: boolean;
    onApply: () => void;
    onUndo: () => void;
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
        const name = equationsLabel(image.params).join("-").replace(" × ", "-");
        download(image.url, `samila-${name}-${image.params.seed}-${image.size}.png`);
        return;
    }
    const size = DEFAULT_PARAMS.size ?? autoSize();
    download(
        `/api/image?${renderQuery(DEFAULT_PARAMS, size)}`,
        `samila-${DEFAULT_PARAMS.eq}-${DEFAULT_PARAMS.seed}-${size}.png`,
    );
}

export default function SamilaImage({
    image,
    loading,
    elapsed,
    error,
    onCancel,
    stale,
    onApply,
    onUndo,
}: ImageProps) {
    // an out of date image fades, so a change that hasn't rendered yet doesn't look ignored
    const faded = loading ? "opacity-75" : stale ? "opacity-40" : "";
    const shown = image?.params ?? DEFAULT_PARAMS;
    const [kind, label] = equationsLabel(shown);
    // the frame takes the image's shape, and never grows taller than the window below the header
    const aspect = shown.aspect;
    // the page's address, known only in the browser
    const [origin, setOrigin] = useState("");
    const [page, setPage] = useState("");

    useEffect(() => {
        setOrigin(window.location.origin);
        setPage(`${window.location.origin}${window.location.pathname}`);
    }, []);

    return (
        <div
            className="mx-auto flex w-full min-w-0 flex-col"
            style={{ maxWidth: `min(100%, calc((100svh - 240px) * ${aspect}))` }}
        >
            <div
                className="relative w-full overflow-hidden rounded-md border border-line bg-surface"
                style={{
                    aspectRatio: aspect,
                    // a checkerboard shows through a transparent background
                    ...(shown.bg === "transparent" && {
                        background:
                            "repeating-conic-gradient(var(--sam-line) 0 25%, transparent 0 50%) 0 0 / 16px 16px",
                    }),
                }}
            >
                <Image
                    src={image?.url ?? DEFAULT_IMAGE}
                    alt={`Samila generative art, ${kind} ${label}, seed ${shown.seed}`}
                    width={1400}
                    height={Math.round(1400 / aspect)}
                    className={`size-full object-contain transition-opacity duration-300 ${faded}`}
                    priority
                />
                {stale && !loading && (
                    <>
                        {/* clicking the faded image applies the changes too */}
                        <button
                            type="button"
                            aria-label="apply changes"
                            onClick={onApply}
                            className="absolute inset-0 cursor-pointer"
                        />
                        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-line bg-surface/95 py-1 pr-1 pl-3 text-xs whitespace-nowrap shadow-sm backdrop-blur transition-all starting:translate-y-1 starting:opacity-0">
                            <span>settings changed</span>
                            <button
                                type="button"
                                onClick={onUndo}
                                className="ml-1 rounded-full px-2 py-0.5 text-muted transition-colors hover:bg-ink/10 hover:text-ink"
                            >
                                undo
                            </button>
                            <button
                                type="button"
                                onClick={onApply}
                                className="rounded-full bg-ink px-2.5 py-0.5 font-medium text-bg transition-opacity hover:opacity-85"
                            >
                                apply
                            </button>
                        </div>
                    </>
                )}
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
                        {kind} <span className="font-mono text-ink">{label}</span>
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
                        value={curlCommand(origin, shown, image?.size ?? 1000)}
                        label="copy API call"
                        icon={<FiTerminal size="1.05rem" />}
                    />
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
