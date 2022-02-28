import Layout from "../components/Layout";
import Plot from "../components/Plot";
import { useEffect } from "react";

export default function IndexPage() {
    // ping heroku server to hot start
    useEffect(() => {
        fetch("/api/");
    }, []);

    return (
        <Layout title="Samila">
            <Plot />
        </Layout>
    );
}
