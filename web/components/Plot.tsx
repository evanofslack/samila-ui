import { useState } from "react";
import { Button, Checkbox } from "@mantine/core";
import { GeneratorParams } from "../interfaces";
import { DEFAULT_PARAMS } from "../lib/api";
import useGenerator from "../hooks/useGenerator";
import SamilaImage from "./SamilaImage";
import ColorInput from "./ColorInput";
import SelectProj from "./SelectProj";
import InputEq from "./InputEq";
import Advanced from "./Advanced";

export default function Plot() {
    const [params, setParams] = useState<GeneratorParams>(DEFAULT_PARAMS);
    const [randomSeed, setRandomSeed] = useState(true);
    const { image, loading, generate } = useGenerator();

    function update<K extends keyof GeneratorParams>(key: K, value: GeneratorParams[K]) {
        setParams((prev) => ({ ...prev, [key]: value }));
    }

    function regeneratePlot() {
        generate({ ...params, seed: randomSeed ? null : (image?.params.seed ?? null) });
    }

    return (
        <div className="flex flex-col items-center justify-center lg:flex-row lg:items-start lg:justify-evenly">
            <SamilaImage image={image} />
            <div className="flex w-full max-w-sm flex-col gap-2 bg-white px-4 py-6 drop-shadow-sm lg:mt-8 lg:mr-4">
                <div className="mb-1 flex flex-row items-center justify-around">
                    <Button onClick={regeneratePlot} variant="default" loading={loading}>
                        generate
                    </Button>
                    <Checkbox
                        checked={randomSeed}
                        onChange={(e) => setRandomSeed(e.currentTarget.checked)}
                        label="random seed"
                        color="dark"
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
                <Advanced params={params} update={update} />
            </div>
        </div>
    );
}
