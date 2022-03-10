import React, { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { GeneratorParams } from "../interfaces";
import useGenerator from "../hooks/useGenerator";
import SamilaImage from "./SamilaImage";
import ColorInput from "./ColorInput";
import SelectProj from "./SelectProj";
import InputEq from "./InputEq";
import { Button, Checkbox } from "@mantine/core";
import MySlider from "./MySlider";

export default function Plot() {
    const initialParam: GeneratorParams = {
        eq: 1,
        proj: "rectilinear",
        color: "#000000",
        bg: "#ffffff",
        spot: 50,
        seed: null,
        text: null,
    };
    const [line, setLine] = useState(initialParam.color);
    const [bg, setBg] = useState(initialParam.bg);
    const [eq, setEq] = useState(initialParam.eq);
    const [proj, setProj] = useState(initialParam.proj);
    const [spot, setSpot] = useState(initialParam.spot);
    const [seed, setSeed] = useState(initialParam.seed);
    const [applySeed, setApplySeed] = useState(true);

    const [params, setParams] = useState<GeneratorParams>(initialParam);
    const { img, loading, imgSeed } = useGenerator(params);
    const [active, setActive] = useState("line");

    function regeneratePlot() {
        setParams((prevParams) => ({
            ...prevParams,
            color: line,
            bg: bg,
            spot: spot / 100, // api takes spot_size 0.0 - 1.0, slider goes 0.0 - 100.0
            proj: proj,
            eq: eq,
            seed: seed,
        }));
    }

    return (
        <div className="flex flex-col items-center justify-center lg:flex-row lg:justify-evenly ">
            <SamilaImage img={img} />
            <div className="flex flex-col items-center lg:bg-white lg:drop-shadow-sm lg:px-2 lg:mr-4 lg:py-6">
                <div className="flex flex-row w-full items-center justify-around justify-items-center mb-3">
                    <Button
                        onClick={regeneratePlot}
                        variant="white"
                        color="dark"
                        radius={0}
                        loading={loading}
                        className="bg-white font-normal text-[1.05rem] color-black border border-black"
                    >
                        {loading ? "generating" : "generate"}
                    </Button>
                    <Checkbox
                        checked={applySeed}
                        onChange={(e) => {
                            applySeed ? setSeed(imgSeed) : setSeed(null);
                            setApplySeed(e.currentTarget.checked);
                        }}
                        radius={0}
                        label="random seed"
                    />
                </div>
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
                    <MySlider title="spot size" value={spot} setValue={setSpot} />
                </div>
            </div>
        </div>
    );
}
