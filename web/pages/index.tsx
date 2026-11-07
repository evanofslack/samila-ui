import Layout from "../components/Layout";
import Plot from "../components/Plot";
import About from "../components/About";
import Gallery from "../components/Gallery";

export default function IndexPage() {
    return (
        <Layout title="Samila">
            <Plot />
            <About />
            <Gallery />
        </Layout>
    );
}
