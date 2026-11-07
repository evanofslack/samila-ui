import { useState } from "react";
import { Button, Checkbox, ColorPicker } from "@mantine/core";
import { GeneratorParams } from "../interfaces";
import useGenerator from "../hooks/useGenerator";
import SamilaImage from "./SamilaImage";
import ColorInput from "./ColorInput";
import SelectProj from "./SelectProj";
import InputEq from "./InputEq";
import MySlider from "./MySlider";

const initialParams: GeneratorParams = {
    eq: 1,
    seed: null,
    proj: "rectilinear",
    color: "#000000",
    bg: "#ffffff",
    spot: 0.5,
};

type ColorTarget = "color" | "bg";

export default function Plot() {
    const [params, setParams] = useState<GeneratorParams>(initialParams);
    const [randomSeed, setRandomSeed] = useState(true);
    const [active, setActive] = useState<ColorTarget>("color");
    const { image, loading, generate } = useGenerator();

    function update<K extends keyof GeneratorParams>(key: K, value: GeneratorParams[K]) {
        setParams((prev) => ({ ...prev, [key]: value }));
    }

    function regeneratePlot() {
        // with a fixed seed, reuse the last image's seed
        generate({ ...params, seed: randomSeed ? null : (image?.seed ?? null) });
    }

    return (
        <div className="flex flex-col items-center justify-center lg:flex-row lg:items-start lg:justify-evenly">
            <SamilaImage image={image} />
            <div className="flex flex-col items-center lg:mt-8 lg:mr-4 lg:bg-white lg:px-2 lg:py-6 lg:drop-shadow-sm">
                <div className="mb-3 flex w-full flex-row items-center justify-around">
                    <Button
                        onClick={regeneratePlot}
                        variant="default"
                        loading={loading}
                        className="border-black text-[1.05rem] font-normal"
                    >
                        generate
                    </Button>
                    <Checkbox
                        checked={randomSeed}
                        onChange={(e) => setRandomSeed(e.currentTarget.checked)}
                        label="random seed"
                        color="dark"
                    />
                </div>
                <div className="flex flex-row items-center justify-center lg:mx-6">
                    <div className="flex w-36 flex-col pr-4">
                        <div className="flex flex-row items-end pb-1">
                            <ColorInput
                                color={params.color}
                                title="line"
                                active={active === "color"}
                                onSelect={() => setActive("color")}
                            />
                            <ColorInput
                                color={params.bg}
                                title="bg"
                                active={active === "bg"}
                                onSelect={() => setActive("bg")}
                            />
                        </div>
                        <SelectProj proj={params.proj} setProj={(proj) => update("proj", proj)} />
                        <InputEq eq={params.eq} setEq={(eq) => update("eq", eq)} />
                    </div>
                    <ColorPicker
                        format="hex"
                        value={params[active]}
                        onChange={(value) => update(active, value)}
                        aria-label={active === "color" ? "line colour" : "background colour"}
                    />
                </div>
                <div className="flex w-5/6 flex-col items-start px-4 pt-2">
                    <MySlider
                        title="spot size"
                        value={params.spot}
                        setValue={(spot) => update("spot", spot)}
                        min={0.01}
                        max={1}
                        step={0.01}
                    />
                </div>
            </div>
        </div>
    );
}
