import { useCallback, useEffect, useRef, useState } from "react";
import { notifications } from "@mantine/notifications";
import { GeneratedImage, GeneratorParams } from "../interfaces";
import { ApiError, apiError, autoSize, NETWORK_ERROR, paramsQuery } from "../lib/api";

// renders kept for going back; each holds its PNG in memory as an object URL
const HISTORY = 12;

function headerInt(resp: Response, name: string): number | null {
    const value = parseInt(resp.headers.get(name) ?? "", 10);
    return Number.isNaN(value) ? null : value;
}

// fetches images on demand and keeps the last few, freeing each when it drops off the end
export default function useGenerator() {
    const [image, setImage] = useState<GeneratedImage | null>(null);
    // newest first
    const [history, setHistory] = useState<GeneratedImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);
    // whole seconds since the current render started
    const [elapsed, setElapsed] = useState(0);
    const controllerRef = useRef<AbortController | null>(null);
    const historyRef = useRef<GeneratedImage[]>([]);

    useEffect(() => {
        return () => {
            controllerRef.current?.abort();
            historyRef.current.forEach((entry) => URL.revokeObjectURL(entry.url));
            historyRef.current = [];
        };
    }, []);

    useEffect(() => {
        if (!loading) {
            return;
        }
        const started = Date.now();
        setElapsed(0);
        const timer = setInterval(
            () => setElapsed(Math.floor((Date.now() - started) / 1000)),
            1000,
        );
        return () => clearInterval(timer);
    }, [loading]);

    const fail = useCallback((err: ApiError) => {
        setError(err);
        notifications.show({ color: "red", title: err.title, message: err.message });
    }, []);

    const remember = useCallback((entry: GeneratedImage) => {
        const next = [entry, ...historyRef.current];
        next.slice(HISTORY).forEach((old) => URL.revokeObjectURL(old.url));
        historyRef.current = next.slice(0, HISTORY);
        setHistory(historyRef.current);
        setImage(entry);
    }, []);

    const generate = useCallback(
        async (params: GeneratorParams) => {
            controllerRef.current?.abort();
            const controller = new AbortController();
            controllerRef.current = controller;
            setLoading(true);
            setError(null);

            try {
                const size = params.size ?? autoSize();
                const query = paramsQuery(params);
                query.set("size", String(size));
                const resp = await fetch(`/api/image?${query}`, {
                    signal: controller.signal,
                });
                if (!resp.ok) {
                    fail(await apiError(resp));
                    return;
                }
                const blob = await resp.blob();
                if (controller.signal.aborted) {
                    return;
                }
                remember({
                    url: URL.createObjectURL(blob),
                    params: {
                        ...params,
                        // X-Eq is only sent for a numbered variation
                        eq: headerInt(resp, "X-Eq"),
                        f1: headerInt(resp, "X-F1") ?? params.f1,
                        f2: headerInt(resp, "X-F2") ?? params.f2,
                        seed: headerInt(resp, "X-Seed") ?? params.seed ?? 0,
                    },
                    size,
                });
            } catch {
                if (!controller.signal.aborted) {
                    fail(NETWORK_ERROR);
                }
            } finally {
                // a newer request owns the loading state once it has started
                if (controllerRef.current === controller) {
                    controllerRef.current = null;
                    setLoading(false);
                }
            }
        },
        [fail, remember],
    );

    // stop waiting for the current render; the image shown stays
    const cancel = useCallback(() => {
        controllerRef.current?.abort();
        controllerRef.current = null;
        setLoading(false);
    }, []);

    // show an earlier render again, without asking the server
    const restore = useCallback((entry: GeneratedImage) => {
        setImage(entry);
        setError(null);
    }, []);

    return { image, history, loading, elapsed, error, generate, cancel, restore };
}
