import { useEffect, useState } from "react";

export type RandomEquations = { f1: string; f2: string };

// fseed -> formulas; they never change for a seed, so each is fetched once per visit
const cache = new Map<number, RandomEquations>();

// the two equations samila writes for a function seed, once the API has said
export default function useRandomEquations(fseed: number | null): RandomEquations | null {
    const [equations, setEquations] = useState<RandomEquations | null>(
        fseed !== null ? (cache.get(fseed) ?? null) : null,
    );

    useEffect(() => {
        if (fseed === null) {
            setEquations(null);
            return;
        }
        const cached = cache.get(fseed);
        setEquations(cached ?? null);
        if (cached) {
            return;
        }
        const controller = new AbortController();
        // wait for typing in the seed field to settle
        const timer = setTimeout(async () => {
            try {
                const resp = await fetch(`/api/equations/random/${fseed}`, {
                    signal: controller.signal,
                });
                if (!resp.ok) {
                    return;
                }
                const body = await resp.json();
                const result = { f1: body.f1.display, f2: body.f2.display };
                cache.set(fseed, result);
                setEquations(result);
            } catch {
                // the formulas are a nicety; the render reports real errors
            }
        }, 250);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [fseed]);

    return equations;
}
