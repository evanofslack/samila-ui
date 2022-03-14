import Layout from "../components/Layout";
import Plot from "../components/Plot";
import { useEffect } from "react";
import Gallery from "../components/Gallery";
import { Grid } from "@mantine/core";
import GalleryImage from "../components/GalleryImage";

export default function IndexPage() {
    // ping heroku server to hot start
    useEffect(() => {
        fetch("/api/");
    }, []);

    return (
        <Layout title="Samila">
            <Plot />
            <Gallery />
        </Layout>
    );
}
