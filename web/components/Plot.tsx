import { useEffect, useRef, useState } from "react";
import { Button, Tooltip } from "@mantine/core";
import { FiRefreshCw, FiShuffle } from "react-icons/fi";
import { GeneratorParams } from "../interfaces";
import { paramsQuery, parseQuery } from "../lib/api";
import { GALLERY_SIZE, GalleryEntry } from "../lib/gallery";
import { DEFAULT_PARAMS } from "../lib/presets";
import { randomSeed, surpriseParams } from "../lib/randomize";
import useGenerator from "../hooks/useGenerator";
import HistoryStrip from "./HistoryStrip";
import SamilaImage from "./SamilaImage";
import Panel from "./panel/Panel";
import SeedField from "./panel/SeedField";

const KEYS: (keyof GeneratorParams)[] = [
    "eq",
    "f1",
    "f2",
    "fseed",
    "seed",
    "start",
    "stop",
    "step",
    "proj",
    "mode",
    "color",
    "bg",
    "cmap",
    "colors",
    "marker",
    "spot",
    "alpha",
    "linewidth",
    "rotation",
    "size",
    "aspect",
];

function sameParams(a: GeneratorParams, b: GeneratorParams): boolean {
    return KEYS.every((key) => String(a[key]) === String(b[key]));
}

type ActionsProps = {
    dirty: boolean;
    locked: boolean;
    loading: boolean;
    onGenerate: () => void;
    onSurprise: () => void;
};

type ApplyBarProps = {
    loading: boolean;
    onApply: () => void;
    onUndo: () => void;
};

// apply or undo the changes, for when the top of the panel is out of sight
function ApplyBar({ loading, onApply, onUndo }: ApplyBarProps) {
    return (
        <div className="flex flex-row gap-2">
            <Button
                onClick={onApply}
                loading={loading}
                className="flex-1"
                leftSection={<span className="size-1.5 rounded-full bg-current" aria-hidden />}
            >
                apply changes
            </Button>
            <Button onClick={onUndo} variant="default" disabled={loading}>
                undo
            </Button>
        </div>
    );
}

// apply changes when the controls differ from the image, else a new image with a new seed
function Actions({ dirty, locked, loading, onGenerate, onSurprise }: ActionsProps) {
    const label = dirty ? "apply changes" : "new image";
    return (
        <div className="flex flex-row gap-2">
            <Tooltip
                label="unlock the seed for a new image"
                withArrow
                openDelay={400}
                disabled={dirty || !locked}
            >
                <Button
                    onClick={onGenerate}
                    loading={loading}
                    disabled={!dirty && locked}
                    className="flex-1"
                    leftSection={
                        dirty ? (
                            <span className="size-1.5 rounded-full bg-current" aria-hidden />
                        ) : (
                            <FiRefreshCw aria-hidden />
                        )
                    }
                >
                    {label}
                </Button>
            </Tooltip>
            <Button
                onClick={onSurprise}
                variant="default"
                disabled={loading}
                leftSection={<FiShuffle aria-hidden />}
                className="flex-1"
            >
                surprise me
            </Button>
        </div>
    );
}

type PlotProps = {
    // told about each image shown, so the rest of the page can describe it
    onShown?: (params: GeneratorParams, size: number) => void;
    // a gallery image to open; a new object each time one is picked
    picked?: GalleryEntry | null;
};

export default function Plot({ onShown, picked }: PlotProps) {
    const [params, setParams] = useState<GeneratorParams>(DEFAULT_PARAMS);
    const [locked, setLocked] = useState(false);
    const scrollPending = useRef(false);
    // whether the panel's top buttons are on screen, so the apply bar doesn't repeat them
    const topActions = useRef<HTMLDivElement>(null);
    const [topVisible, setTopVisible] = useState(true);
    const { image, history, loading, elapsed, error, generate, cancel, restore, show } =
        useGenerator();

    // the image on screen: the pre-rendered default until the first render
    const shown = image?.params ?? DEFAULT_PARAMS;
    const dirty = !sameParams(params, shown);

    function update<K extends keyof GeneratorParams>(key: K, value: GeneratorParams[K]) {
        setParams((prev) => ({ ...prev, [key]: value }));
    }

    function merge(values: Partial<GeneratorParams>) {
        setParams((prev) => ({ ...prev, ...values }));
    }

    function run(next: GeneratorParams) {
        const withSeed = { ...next, seed: next.seed ?? randomSeed() };
        setParams(withSeed);
        generate(withSeed);
    }

    function onGenerate() {
        if (dirty) {
            run(params);
        } else if (!locked) {
            run({ ...params, seed: randomSeed() });
        }
    }

    function onApply() {
        run(params);
    }

    function onUndo() {
        setParams(shown);
    }

    useEffect(() => {
        const node = topActions.current;
        if (!node) {
            return;
        }
        const observer = new IntersectionObserver(([entry]) => setTopVisible(entry.isIntersecting), {
            rootMargin: "-56px 0px 0px 0px",
        });
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    function onSurprise() {
        run({ ...surpriseParams(), size: params.size, aspect: params.aspect });
    }

    // a link with params renders straight away, keeping its seed
    useEffect(() => {
        const fromLink = parseQuery(new URLSearchParams(window.location.search));
        if (fromLink) {
            run(fromLink);
        }
    }, []);

    // a gallery pick shows its full image straight away, with its settings in the panel
    useEffect(() => {
        if (!picked) {
            return;
        }
        show({ url: picked.src, params: picked.params, size: GALLERY_SIZE });
        setParams(picked.params);
        scrollPending.current = true;
    }, [picked]);

    // scroll up once the picked image is laid out; firefox drops a smooth scroll whose
    // target moves under it
    useEffect(() => {
        if (scrollPending.current) {
            scrollPending.current = false;
            requestAnimationFrame(() =>
                document
                    .getElementById("editor")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" }),
            );
        }
    }, [image]);

    // the address bar describes the image on screen
    useEffect(() => {
        if (image) {
            onShown?.(image.params, image.size);
            const url = `${window.location.pathname}?${paramsQuery(image.params)}`;
            window.history.replaceState(window.history.state, "", url);
        }
    }, [image]);

    const actions = (
        <Actions
            dirty={dirty}
            locked={locked}
            loading={loading}
            onGenerate={onGenerate}
            onSurprise={onSurprise}
        />
    );

    return (
        <div
            id="editor"
            className="mx-auto grid max-w-7xl scroll-mt-20 grid-cols-[minmax(0,1fr)] items-start gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12"
        >
            <div className="lg:sticky lg:top-[72px]">
                <SamilaImage
                    image={image}
                    loading={loading}
                    elapsed={elapsed}
                    error={error}
                    onCancel={cancel}
                    stale={dirty}
                    onApply={onApply}
                    onUndo={onUndo}
                />
                <HistoryStrip
                    history={history}
                    current={image}
                    onRestore={(entry) => {
                        restore(entry);
                        setParams(entry.params);
                    }}
                />
            </div>
            <div className="flex w-full flex-col gap-4 rounded-md border border-line bg-surface p-5">
                <div ref={topActions} className="hidden lg:block">
                    {actions}
                </div>
                <SeedField
                    seed={params.seed}
                    setSeed={(seed) => update("seed", seed)}
                    locked={locked}
                    setLocked={setLocked}
                />
                <Panel params={params} update={update} merge={merge} />
                {dirty && !topVisible && (
                    <div className="sticky bottom-4 z-20 -mx-2 hidden rounded-md border border-line bg-surface p-2 shadow-md backdrop-blur transition-all starting:translate-y-2 starting:opacity-0 lg:block">
                        <ApplyBar loading={loading} onApply={onApply} onUndo={onUndo} />
                    </div>
                )}
            </div>
            {/* phones keep the actions in reach at the bottom of the screen */}
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/90 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
                {dirty ? <ApplyBar loading={loading} onApply={onApply} onUndo={onUndo} /> : actions}
            </div>
        </div>
    );
}
