import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Input from "../components/Input";

export default function IndexPage() {
    return (
        <Layout title="Samila">
            <div className="flex flex-col items-center justify-center">
                <div className="flex flex-col items-start justify-center w-5/6 w-max-96">
                    <h1 className="text-4xl pt-6 font-light">Samila</h1>
                    {/* <h2 className="pt-2 text-1.5rem font-extralight">
                        A collection of generative art{" "}
                    </h2> */}
                </div>
                <Input />
            </div>
            <div className="w-screen h-screen"></div>
        </Layout>
    );
}
