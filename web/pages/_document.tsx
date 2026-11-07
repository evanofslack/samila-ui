import { Html, Head, Main, NextScript } from "next/document";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";

export default function Document() {
    return (
        <Html lang="en" {...mantineHtmlProps}>
            <Head>
                <ColorSchemeScript defaultColorScheme="auto" />
            </Head>
            <body className="m-0 p-0">
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
