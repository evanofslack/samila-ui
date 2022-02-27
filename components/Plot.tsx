import React, { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { GeneratorParams } from "../interfaces";
import useGenerator from "../hooks/useGenerator";
import ClipLoader from "react-spinners/ClipLoader";
import Image from "next/image";
import Select from "react-select";

export default function Plot() {
    const initialParam: GeneratorParams = {
        eq: 17,
        proj: "rectilinear",
        color: "#000000",
        bg: "#ffffff",
        seed: null,
        text: null,
    };
    const [params, setParams] = useState<GeneratorParams>(initialParam);
    const [color, setColor] = useState(initialParam.color);
    const [bg, setBg] = useState(initialParam.bg);
    const [eq, setEq] = useState(initialParam.eq);
    const [proj, setProj] = useState(initialParam.proj);
    const [active, setActive] = useState("color");

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
    function handleSelect(option: any) {
        setProj(option.value);
    }

    return (
        <div className="flex flex-col items-center justify-center ">
            <div className="relative flex flex-col items-center justify-center ">
                {img && <img className="p-6" src={img} alt="plot" />}
                {!img && <Image src="/images/example.png" alt="plot" width="1000" height="1000" />}
            </div>
            <div className="flex flex-row items-center justify-center">
                <div className="flex flex-row pr-4 ">
                    <div className="flex flex-col">
                        <div className="flex flex-col items-end pr-4 pb-4">
                            <div
                                className="flex flex-row items-center p-1"
                                onClick={() => setActive("color")}
                            >
                                <p className="pr-2 font-light">color</p>
                                <div
                                    className="w-8 h-8 border border-black"
                                    style={{ backgroundColor: color }}
                                />
                            </div>

                            <div
                                className="flex flex-row items-center p-1"
                                onClick={() => setActive("bg")}
                            >
                                <p className="pr-2 font-light">bg</p>
                                <div
                                    className="w-8 h-8 border border-black"
                                    style={{ backgroundColor: bg }}
                                />
                            </div>
                        </div>
                        <Select
                            defaultValue={proj}
                            onChange={handleSelect}
                            simpleValue={true}
                            options={[
                                { value: "rectilinear", label: "rectilinear" },
                                { value: "polar", label: "polar" },
                                { value: "hammer", label: "hammer" },
                            ]}
                        />
                        <div>{proj}</div>
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
                className="border font-light border-black p-1 flex items-center justify-center mt-4 w-24"
                onClick={regeneratePlot}
            >
                {!loading && <p>Generate</p>}
                <ClipLoader loading={loading} size={25} speedMultiplier={0.5} />
            </button>
        </div>
    );
}
