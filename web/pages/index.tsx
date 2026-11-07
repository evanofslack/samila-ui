import Layout from "../components/Layout";
import Plot from "../components/Plot";
import About from "../components/About";
import Gallery from "../components/Gallery";

export default function IndexPage() {
    return (
        <Layout title="Samila">
            <section className="mx-auto max-w-7xl px-4 pt-8 pb-6 sm:px-6 lg:pt-12 lg:pb-8">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    Generative art from equations
                </h1>
                <p className="mt-2 max-w-xl text-muted">
                    Thousands of points pushed through two equations. Tweak the settings, then
                    render.
                </p>
            </section>
            <Plot />
            <About />
            <Gallery />
        </Layout>
    );
}
