import { useEffect, useState } from "react";
import PopoverPicker from "../components/PopoverPicker";
import Layout from "../components/Layout";
import useGenerator from "../hooks/useGenerator";
import { GeneratorParams } from "../interfaces";

const initialParam: GeneratorParams = {
    eq: 17,
    proj: null,
    color: "f2e824",
    bg: "3b0647",
    seed: null,
    text: null,
};

export default function IndexPage() {
    const [params, setParams] = useState<GeneratorParams>(initialParam);
    const { img, loading } = useGenerator(params);
    const [color, setColor] = useState(initialParam.color);
    const [bg, setBg] = useState(initialParam.bg);

    function updateColor() {
        setParams((prevParams) => ({
            ...prevParams,
            color: color.substring(1),
            bg: bg.substring(1),
        }));
    }

    return (
        <Layout title="Samila">
            <div className="flex flex-col items-start justify-center">
                <h1 className="text-5xl pt-8 pl-10 font-light">Samila</h1>
                <h2 className="pt-2 pl-10 text-1.5rem font-extralight">
                    A collection of generative art{" "}
                </h2>
                <div className="flex flex-col items-center justify-center px16">
                    {loading && <p>loading</p>}
                    {img && <img className="p-6" src={img} alt="plot" />}
                </div>
                <div className="flex flex-row items-center justify-around w-96">
                    <div className="flex flex-col ">
                        <PopoverPicker color={color} onChange={setColor} title="color" />
                        <PopoverPicker color={bg} onChange={setBg} title="bg" />
                    </div>
                    <button
                        className="p-2 font-light border-solid border border-black hover:bg-gray-100"
                        onClick={updateColor}
                    >
                        Generate New
                    </button>
                </div>
            </div>
            <div className="w-screen h-screen"></div>
        </Layout>
    );
}
