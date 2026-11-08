import { useEffect, useState } from "react";
import { Button, Tooltip } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { FiRefreshCw, FiShuffle } from "react-icons/fi";
import { GeneratorParams } from "../interfaces";
import { paramsQuery, parseQuery } from "../lib/api";
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
    "seed",
    "proj",
    "mode",
    "color",
    "bg",
    "cmap",
    "marker",
    "spot",
    "alpha",
    "rotation",
    "size",
];

function sameParams(a: GeneratorParams, b: GeneratorParams): boolean {
    return KEYS.every((key) => a[key] === b[key]);
}

type ActionsProps = {
    dirty: boolean;
    locked: boolean;
    loading: boolean;
    onGenerate: () => void;
    onSurprise: () => void;
};

// apply changes when the controls differ from the image, else a new image with a new seed
function Actions({ dirty, locked, loading, onGenerate, onSurprise }: ActionsProps) {
    const label = dirty ? "apply changes" : "new image";
    return (
        <div className="flex flex-row gap-2">
            <Tooltip
                label={!dirty && locked ? "unlock the seed for a new image" : "enter"}
                withArrow
                openDelay={400}
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
            <Tooltip label="r" withArrow openDelay={400}>
                <Button
                    onClick={onSurprise}
                    variant="default"
                    disabled={loading}
                    leftSection={<FiShuffle aria-hidden />}
                    className="flex-1"
                >
                    surprise me
                </Button>
            </Tooltip>
        </div>
    );
}

type PlotProps = {
    // told about each image shown, so the rest of the page can describe it
    onShown?: (params: GeneratorParams, size: number) => void;
};

export default function Plot({ onShown }: PlotProps) {
    const [params, setParams] = useState<GeneratorParams>(DEFAULT_PARAMS);
    const [locked, setLocked] = useState(false);
    const { image, history, loading, elapsed, error, generate, cancel, restore } = useGenerator();

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

    function onSurprise() {
        run({ ...surpriseParams(), size: params.size });
    }

    useHotkeys(
        [
            ["Enter", () => !loading && onGenerate()],
            ["r", () => !loading && onSurprise()],
        ],
        ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"],
    );

    // a link with params renders straight away, keeping its seed
    useEffect(() => {
        const fromLink = parseQuery(new URLSearchParams(window.location.search));
        if (fromLink) {
            run(fromLink);
        }
    }, []);

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
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] items-start gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
            <div className="lg:sticky lg:top-[72px]">
                <SamilaImage
                    image={image}
                    loading={loading}
                    elapsed={elapsed}
                    error={error}
                    onCancel={cancel}
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
                <div className="hidden lg:block">{actions}</div>
                <SeedField
                    seed={params.seed}
                    setSeed={(seed) => update("seed", seed)}
                    locked={locked}
                    setLocked={setLocked}
                />
                <Panel params={params} update={update} merge={merge} />
            </div>
            {/* phones keep the actions in reach at the bottom of the screen */}
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/90 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
                {actions}
            </div>
        </div>
    );
}
