import React, { ReactNode } from "react";
import MobileNav from "./MobileNav";
import Head from "next/head";

type Props = {
    children?: ReactNode;
    title?: string;
};

const Layout = ({ children, title = "This is the default title" }: Props) => (
    <div>
        <Head>
            <title>{title}</title>
            <meta charSet="utf-8" />
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        <header>
            <nav className="flex flex-row items-center justify-between pt-5 pl-8 w-full">
                <h1 className="text-3xl font-semibold ">Samila</h1>
                <MobileNav />
            </nav>
        </header>
        {children}
        <footer></footer>
    </div>
);

export default Layout;
