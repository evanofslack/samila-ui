import { ReactNode } from "react";
import Head from "next/head";
import Header from "./Header";
import Footer from "./Footer";

const SITE = "https://samila.evanslack.dev";
const DESCRIPTION =
    "Create generative art in your browser with Samila: mathematical equations applied to thousands of random points.";

type Props = {
    children?: ReactNode;
    title?: string;
};

export default function Layout({ children, title = "Samila" }: Props) {
    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <meta name="description" content={DESCRIPTION} />
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={SITE} />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={DESCRIPTION} />
                <meta property="og:image" content={`${SITE}/images/example_0.webp`} />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="grow">{children}</main>
                <Footer />
            </div>
        </>
    );
}
