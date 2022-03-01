import React, { ReactNode } from "react";
import MobileNav from "./MobileNav";
import Head from "next/head";
import Footer from "../components/Footer";
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
            <nav className="flex flex-row items-center justify-between pt-5 pl-8 w-full lg:pt-10 lg:pl-16 lg:pb-6">
                <h1 className="text-3xl font-semibold lg:text-5xl ">Samila</h1>
                <MobileNav />
            </nav>
        </header>
        {children}
        <footer className=" text-sm font-light flex flex-row justify-between w-screen p-6 pb-4 pt-10">
            <p> &copy; 2022 Samila </p>
            <a href="https://github.com/evanofslack/samila-ui">
                <FiGithub size="1.2rem" />
            </a>
        </footer>
    </div>
);

export default Layout;
