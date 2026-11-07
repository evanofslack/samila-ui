import React from "react";
import { AppProps } from "next/app";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { theme } from "../lib/theme";

import "../styles/index.css";

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <MantineProvider theme={theme} defaultColorScheme="light">
            <Notifications position="top-right" />
            <Component {...pageProps} />
        </MantineProvider>
    );
}

export default MyApp;
