import { useCallback, useEffect, useRef, useState } from "react";
import { notifications } from "@mantine/notifications";
import { GeneratedImage, GeneratorParams } from "../interfaces";
import { ApiError, apiError, autoSize, NETWORK_ERROR, paramsQuery } from "../lib/api";

function headerInt(resp: Response, name: string, fallback: number): number {
    const value = parseInt(resp.headers.get(name) ?? "", 10);
    return Number.isNaN(value) ? fallback : value;
}

// fetches images on demand, keeping one object URL alive at a time
export default function useGenerator() {
    const [image, setImage] = useState<GeneratedImage | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);
    // whole seconds since the current render started
    const [elapsed, setElapsed] = useState(0);
    const controllerRef = useRef<AbortController | null>(null);
    const urlRef = useRef<string | null>(null);

    useEffect(() => {
        return () => {
            controllerRef.current?.abort();
            if (urlRef.current) {
                URL.revokeObjectURL(urlRef.current);
                urlRef.current = null;
            }
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
                const url = URL.createObjectURL(blob);
                if (urlRef.current) {
                    URL.revokeObjectURL(urlRef.current);
                }
                urlRef.current = url;
                setImage({
                    url,
                    params: {
                        ...params,
                        eq: headerInt(resp, "X-Eq", params.eq),
                        seed: headerInt(resp, "X-Seed", params.seed ?? 0),
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
        [fail],
    );

    // stop waiting for the current render; the image shown stays
    const cancel = useCallback(() => {
        controllerRef.current?.abort();
        controllerRef.current = null;
        setLoading(false);
    }, []);

    return { image, loading, elapsed, error, generate, cancel };
}
