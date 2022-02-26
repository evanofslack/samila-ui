import Link from "next/link";
import Layout from "../components/Layout";

const IndexPage = () => (
    <Layout title="Samila">
        <div className="flex flex-col items-center">
            <h1 className="text-4xl">Create Generative Art</h1>
            <h2 className="text-2xl">Distinctly unique images with beautiful patterns </h2>
        </div>
        <div className="w-screen h-screen"></div>
    </Layout>
);

export default IndexPage;
