import Layout from "../components/Layout";
import Plot from "../components/Plot";
import { useEffect } from "react";
import Gallery from "../components/Gallery";
import About from "../components/About";

export default function IndexPage() {
    // ping heroku server to hot start
    useEffect(() => {
        fetch("/api/");
    }, []);

    return (
        <Layout title="Samila">
            <Plot />
            <About />
            <Gallery />
        </Layout>
    );
}
