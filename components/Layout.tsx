import React, { ReactNode } from "react";
import MobileNav from "./MobileNav";
import Head from "next/head";
import { FiGithub } from "react-icons/fi";

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
            <MobileNav />
        </header>
        {children}
        <footer className=" text-sm font-light flex flex-row justify-between w-screen p-6 pb-4 pt-24">
            <p> &copy; 2022 Samila </p>
            <a href="https://github.com/evanofslack/samila-ui">
                <FiGithub size="1.2rem" />
            </a>
        </footer>
    </div>
);

export default Layout;
