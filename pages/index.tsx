import { useEffect, useState } from "react";
import PopoverPicker from "../components/PopoverPicker";
import Layout from "../components/Layout";
import useGenerator from "../hooks/useGenerator";
import { GeneratorParams } from "../interfaces";

const initialParam: GeneratorParams = {
    eq: null,
    proj: null,
    color: null,
    bg: null,
    seed: null,
    text: null,
};

export default function IndexPage() {
    const [params, setParams] = useState<GeneratorParams>(initialParam);
    const { img, loading } = useGenerator(params);
    const [color, setColor] = useState("#aabbcc");

    function updateColor() {
        setParams((prevParams) => ({
            ...prevParams,
            color: color.substring(1),
        }));
    }

    return (
        <Layout title="Samila">
            <div className="flex flex-col items-center">
                <h1 className="text-4xl pt-12">Create Generative Art</h1>
                <h2 className="text-2xl">Distinctly unique images with beautiful patterns </h2>
            </div>
            <div className="flex flex-col items-center justify-center px16">
                {loading && <p>loading</p>}
                {img && <img src={img} alt="plot" />}
            </div>
            <div className="flex flex-row items-center justify-center">
                <PopoverPicker color={color} onChange={setColor} />
                <button
                    className="p-2 border-solid border-2 border-black hover:bg-gray-100"
                    onClick={updateColor}
                >
                    Change Color
                </button>
            </div>
            <div className="w-screen h-screen"></div>
        </Layout>
    );
}
