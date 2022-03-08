import React, { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { GeneratorParams } from "../interfaces";
import useGenerator from "../hooks/useGenerator";
import SamilaImage from "./SamilaImage";
import ColorInput from "./ColorInput";
import SelectProj from "./SelectProj";
import InputEq from "./InputEq";
import { Button, Slider } from "@mantine/core";

export default function Plot() {
    const initialParam: GeneratorParams = {
        eq: 1,
        proj: "rectilinear",
        color: "#000000",
        bg: "#ffffff",
        seed: null,
        text: null,
    };
    const [line, setLine] = useState(initialParam.color);
    const [bg, setBg] = useState(initialParam.bg);
    const [eq, setEq] = useState(initialParam.eq);
    const [proj, setProj] = useState(initialParam.proj);
    const [opacity, setOpacity] = useState(10);
    const [lineweight, setLineweight] = useState(10);
    const [active, setActive] = useState("line");

    const [params, setParams] = useState<GeneratorParams>(initialParam);
    const { img, loading } = useGenerator(params);

    function regeneratePlot() {
        setParams((prevParams) => ({
            ...prevParams,
            color: line,
            bg: bg,
            proj: proj,
            eq: eq,
        }));
    }

    return (
        <div className="flex flex-col items-center justify-center lg:flex-row">
            <SamilaImage img={img} />
            <div className="flex flex-col items-center">
                <Button
                    onClick={regeneratePlot}
                    variant="white"
                    color="dark"
                    radius={0}
                    loading={loading}
                    className="mb-4 bg-white font-normal text-[1.05rem] color-black border border-black"
                >
                    {loading ? "Generating" : "Generate"}
                </Button>
                <div className="flex flex-row items-center justify-center lg:mx-6">
                    <div className="flex flex-row pr-4 ">
                        <div className="flex flex-col w-36">
                            <div className="flex flex-row items-end pr-8 pb-1">
                                <ColorInput
                                    color={line}
                                    title="line"
                                    active={active}
                                    setActive={setActive}
                                />

                                <ColorInput
                                    color={bg}
                                    title="bg"
                                    active={active}
                                    setActive={setActive}
                                />
                            </div>
                            <SelectProj
                                proj={proj === "string" ? proj : "rectilinear"}
                                setProj={setProj}
                            />
                            <InputEq eq={eq} setEq={setEq} />
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <HexColorPicker
                            color={active === "line" ? line : bg}
                            onChange={active === "line" ? setLine : setBg}
                            className="rounded-xs"
                        />
                    </div>
                </div>
                <div className="flex flex-col items-start w-5/6 pt-2 px-4">
                    <div className="font-light w-full">
                        <p>Opacity</p>
                        <Slider
                            defaultValue={10}
                            value={opacity}
                            onChange={setOpacity}
                            label={(value) => (value / 100).toFixed(2)}
                            radius={0}
                        />
                    </div>
                    <div className="w-full pt-2 font-light">
                        <p>Lineweight</p>
                        <Slider
                            defaultValue={10}
                            value={lineweight}
                            onChange={setLineweight}
                            label={(value) => (value / 100).toFixed(2)}
                            radius={0}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
