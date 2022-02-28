import React, { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { GeneratorParams } from "../interfaces";
import useGenerator from "../hooks/useGenerator";
import ClipLoader from "react-spinners/ClipLoader";
import Image from "next/image";
import SelectProj from "./SelectProj";
import SelectEq from "./SelectEq";

export default function Plot() {
    const initialParam: GeneratorParams = {
        eq: 1,
        proj: "rectilinear",
        color: "#000000",
        bg: "#ffffff",
        seed: null,
        text: null,
    };
    const [color, setColor] = useState(initialParam.color);
    const [bg, setBg] = useState(initialParam.bg);
    const [eq, setEq] = useState(initialParam.eq);
    const [proj, setProj] = useState(initialParam.proj);
    const [active, setActive] = useState("color");

    const [params, setParams] = useState<GeneratorParams>(initialParam);
    const { img, loading } = useGenerator(params);

    function regeneratePlot() {
        setParams((prevParams) => ({
            ...prevParams,
            color: color,
            bg: bg,
            proj: proj,
            eq: eq,
        }));
    }

    return (
        <div className="flex flex-col items-center justify-center ">
            <div className="relative flex flex-col items-center justify-center m-5 border border-gray-200">
                {img && <img src={img} alt="plot" />}
                {!img && <Image src="/images/example.png" alt="plot" width="1000" height="1000" />}
            </div>
            <div className="flex flex-row items-center justify-center ">
                <div className="flex flex-row pr-4 ">
                    <div className="flex flex-col w-36">
                        <div className="flex flex-col items-end pr-8 pb-1">
                            <div
                                className="flex flex-row items-center p-1"
                                onClick={() => setActive("color")}
                            >
                                <p
                                    className={`pr-2 font-light ${
                                        active === "color" && "underline font-normal"
                                    }`}
                                >
                                    color
                                </p>
                                <div
                                    className="w-8 h-8 border border-black"
                                    style={{ backgroundColor: color }}
                                />
                            </div>

                            <div
                                className="flex flex-row items-center p-1"
                                onClick={() => setActive("bg")}
                            >
                                <p
                                    className={`pr-2 font-light ${
                                        active === "bg" && "underline font-normal"
                                    }`}
                                >
                                    bg
                                </p>
                                <div
                                    className="w-8 h-8 border border-black"
                                    style={{ backgroundColor: bg }}
                                />
                            </div>
                        </div>
                        <SelectProj proj={proj} setProj={setProj} />
                        <SelectEq eq={eq} setEq={setEq} />
                    </div>
                </div>

                <div className="">
                    <HexColorPicker
                        color={active === "color" ? color : bg}
                        onChange={active === "color" ? setColor : setBg}
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
