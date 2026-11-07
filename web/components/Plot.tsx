import { useEffect, useState } from "react";
import { Button, Switch } from "@mantine/core";
import { FiShuffle } from "react-icons/fi";
import { GeneratorParams } from "../interfaces";
import { DEFAULT_PARAMS, MAX_SEED, paramsQuery, parseQuery } from "../lib/api";
import { randomInt } from "../lib/random";
import { randomParams } from "../lib/randomize";
import useGenerator from "../hooks/useGenerator";
import SamilaImage from "./SamilaImage";
import ColorInput from "./ColorInput";
import SelectProj from "./SelectProj";
import InputEq from "./InputEq";
import Advanced from "./Advanced";
import Resolution from "./Resolution";

export default function Plot() {
    const [params, setParams] = useState<GeneratorParams>(DEFAULT_PARAMS);
    const [lockSeed, setLockSeed] = useState(false);
    const { image, loading, generate } = useGenerator();

    function update<K extends keyof GeneratorParams>(key: K, value: GeneratorParams[K]) {
        setParams((prev) => ({ ...prev, [key]: value }));
    }

    // a new seed for every image, unless the seed is locked and there is one to reuse
    function run(next: GeneratorParams, keepSeed: boolean) {
        const seed = keepSeed && next.seed !== null ? next.seed : randomInt(MAX_SEED + 1);
        const withSeed = { ...next, seed };
        setParams(withSeed);
        generate(withSeed);
    }

    // a link with params renders straight away, keeping its seed
    useEffect(() => {
        const fromLink = parseQuery(new URLSearchParams(window.location.search));
        if (fromLink) {
            const hasSeed = fromLink.seed !== null;
            setLockSeed(hasSeed);
            run(fromLink, hasSeed);
        }
    }, []);

    // mirror the controls into the address bar once they've changed
    useEffect(() => {
        if (params === DEFAULT_PARAMS) {
            return;
        }
        const url = `${window.location.pathname}?${paramsQuery(params)}`;
        window.history.replaceState(window.history.state, "", url);
    }, [params]);

    return (
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] items-start gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
            <div className="lg:sticky lg:top-[72px]">
                <SamilaImage image={image} loading={loading} />
            </div>
            <div className="flex w-full flex-col gap-3 rounded-md border border-line bg-surface p-5">
                <div className="flex flex-row gap-2">
                    <Button
                        onClick={() => run(params, lockSeed)}
                        variant="filled"
                        loading={loading}
                        className="flex-1"
                    >
                        generate
                    </Button>
                    <Button
                        onClick={() => run({ ...randomParams(), size: params.size }, true)}
                        variant="default"
                        disabled={loading}
                        leftSection={<FiShuffle aria-hidden />}
                        className="flex-1"
                    >
                        randomize
                    </Button>
                </div>
                <div className="mb-1">
                    <Switch
                        checked={lockSeed}
                        onChange={(e) => setLockSeed(e.currentTarget.checked)}
                        label="lock seed"
                        description={
                            lockSeed && params.seed !== null
                                ? `reusing ${params.seed}`
                                : "new seed each time"
                        }
                    />
                </div>
                <div className="flex flex-row gap-3">
                    <ColorInput
                        label="line"
                        value={params.color}
                        onChange={(color) => update("color", color)}
                        disabled={params.cmap !== null}
                    />
                    <ColorInput
                        label="background"
                        value={params.bg}
                        onChange={(bg) => update("bg", bg)}
                    />
                </div>
                <SelectProj proj={params.proj} setProj={(proj) => update("proj", proj)} />
                <InputEq eq={params.eq} setEq={(eq) => update("eq", eq)} />
                <Resolution size={params.size} setSize={(size) => update("size", size)} />
                <Advanced params={params} update={update} />
            </div>
        </div>
    );
}
