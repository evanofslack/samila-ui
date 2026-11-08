import { useState } from "react";
import Layout from "../components/Layout";
import Plot from "../components/Plot";
import About from "../components/About";
import Gallery from "../components/Gallery";
import { GeneratorParams } from "../interfaces";
import { DEFAULT_PARAMS } from "../lib/presets";

export default function IndexPage() {
    // the image in the editor, described again under how it works
    const [shown, setShown] = useState<{ params: GeneratorParams; size: number }>({
        params: DEFAULT_PARAMS,
        size: 1000,
    });

    return (
        <Layout title="Samila">
            <section className="mx-auto max-w-7xl px-4 pt-8 pb-6 sm:px-6 lg:pt-12 lg:pb-8">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    Generative plotting
                </h1>
                <p className="mt-2 text-muted sm:whitespace-nowrap">
                    Thousands of points rendered through two equations.
                </p>
            </section>
            <Plot onShown={(params, size) => setShown({ params, size })} />
            <About shown={shown.params} size={shown.size} />
            <Gallery />
        </Layout>
    );
}
