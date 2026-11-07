import { useCallback, useEffect, useRef, useState } from "react";
import { notifications } from "@mantine/notifications";
import { GeneratedImage, GeneratorParams } from "../interfaces";
import { ApiError, apiError, NETWORK_ERROR, paramsQuery } from "../lib/api";

function headerInt(resp: Response, name: string, fallback: number): number {
    const value = parseInt(resp.headers.get(name) ?? "", 10);
    return Number.isNaN(value) ? fallback : value;
}

function showError(error: ApiError) {
    notifications.show({ color: "red", title: error.title, message: error.message });
}

// fetches images on demand, keeping one object URL alive at a time
export default function useGenerator() {
    const [image, setImage] = useState<GeneratedImage | null>(null);
    const [loading, setLoading] = useState(false);
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

    const generate = useCallback(async (params: GeneratorParams) => {
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;
        setLoading(true);

        try {
            const resp = await fetch(`/api/image?${paramsQuery(params)}`, {
                signal: controller.signal,
            });
            if (!resp.ok) {
                showError(await apiError(resp));
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
            });
        } catch {
            if (!controller.signal.aborted) {
                showError(NETWORK_ERROR);
            }
        } finally {
            // a newer request owns the loading state once it has started
            if (controllerRef.current === controller) {
                controllerRef.current = null;
                setLoading(false);
            }
        }
    }, []);

    return { image, loading, generate };
}
