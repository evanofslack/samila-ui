import React, { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { GeneratorParams } from "../interfaces";
import useGenerator from "../hooks/useGenerator";
import ClipLoader from "react-spinners/ClipLoader";
import SamilaImage from "./SamilaImage";
import ColorInput from "./ColorInput";
import SelectProj from "./SelectProj";
import InputEq from "./InputEq";

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
        <div className="flex flex-col items-center justify-center ">
            <SamilaImage img={img} />
            <div className="flex flex-row items-center justify-center ">
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

                <div className="">
                    <HexColorPicker
                        color={active === "line" ? line : bg}
                        onChange={active === "line" ? setLine : setBg}
                    />
                </div>
            </div>
            <button
                className="border font-light border-black p-1 flex items-center justify-center mt-6 w-24"
                onClick={regeneratePlot}
            >
                {!loading && <p>Generate</p>}
                <ClipLoader loading={loading} size={25} speedMultiplier={0.5} />
            </button>
        </div>
    );
}
