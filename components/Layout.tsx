import React, { ReactNode } from "react";
import MobileNav from "./MobileNav";
import Head from "next/head";
import Footer from "./Footer";

type Props = {
    children?: ReactNode;
    title?: string;
};

const Layout = ({ children, title = "page" }: Props) => (
    <div>
        <Head>
            <title>{title}</title>
            <meta charSet="utf-8" />
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        <body className="flex flex-col min-h-screen">
            <MobileNav />
            <main className="flex-grow">{children}</main>
            <Footer />
        </body>
    </div>
);

export default Layout;
