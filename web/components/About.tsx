import { ReactNode, useEffect, useState } from "react";
import { FiCopy, FiExternalLink } from "react-icons/fi";
import { GeneratorParams } from "../interfaces";
import { curlCommand, isGradient, resolvedColors } from "../lib/api";
import { DEFAULT_PARAMS } from "../lib/presets";
import CopyIcon from "./CopyIcon";
import { ShownFormulas } from "./pickers/VariationPicker";

type AboutProps = {
    // the image on screen, so the examples describe it
    shown: GeneratorParams;
    size: number;
};

type StepProps = {
    n: number;
    title: string;
    children: ReactNode;
    visual: ReactNode;
};

function Step({ n, title, children, visual }: StepProps) {
    return (
        <div className="flex flex-col gap-3">
            <p className="font-mono text-xs text-muted">0{n}</p>
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            <p className="text-muted">{children}</p>
            <div className="mt-auto rounded-md border border-line bg-surface p-4">{visual}</div>
        </div>
    );
}

// long urls wrap after a ? or &, not in the middle of a value
function breakable(text: string) {
    return text.split(/(?<=[?&])/).map((part, i) => (
        <span key={i}>
            {i > 0 && <wbr />}
            {part}
        </span>
    ));
}

export default function About({ shown, size }: AboutProps) {
    const [origin, setOrigin] = useState("https://samila.evanslack.dev");

    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

    const curl = curlCommand(origin, shown, size);
    const colors = resolvedColors(shown);
    const customGrid =
        shown.start !== DEFAULT_PARAMS.start ||
        shown.stop !== DEFAULT_PARAMS.stop ||
        shown.step !== DEFAULT_PARAMS.step;
    const swatch = (color: string) =>
        color === "transparent"
            ? "repeating-conic-gradient(#c9c6bf 0 25%, #fff 0 50%) 0 0 / 8px 8px"
            : color;

    return (
        <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-16 px-4 pt-24 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">How it works</h2>
            <p className="mt-2 text-muted sm:whitespace-nowrap">
                <a
                    href="https://github.com/sepandhaghighi/samila"
                    className="text-ink underline underline-offset-2"
                >
                    Samila
                </a>{" "}
                is a Python library for generative art. Every image comes from three things.
            </p>

            <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
                <Step
                    n={1}
                    title="Two equations"
                    visual={
                        <div className="flex flex-col gap-2">
                            <ShownFormulas f1={shown.f1} f2={shown.f2} fseed={shown.fseed} />
                            {customGrid && (
                                <p className="font-mono text-xs text-muted">
                                    x, y from {shown.start.toFixed(2)} to {shown.stop.toFixed(2)},
                                    step {shown.step}
                                </p>
                            )}
                        </div>
                    }
                >
                    A grid of points goes through two equations, f₁ and f₂.
                </Step>
                <Step
                    n={2}
                    title="A seed"
                    visual={
                        <p className="font-mono text-sm">
                            <span className="text-muted">seed = </span>
                            {shown.seed}
                        </p>
                    }
                >
                    A random number nudges every point. The same seed gives the same image.
                </Step>
                <Step
                    n={3}
                    title="A plot"
                    visual={
                        <div className="flex items-center gap-3 text-sm">
                            <span
                                className="relative size-8 shrink-0 overflow-hidden rounded-full border border-line"
                                style={{ background: swatch(colors.bg) }}
                            >
                                <span
                                    className="absolute inset-[30%] rounded-full"
                                    style={{
                                        background: isGradient(shown)
                                            ? `linear-gradient(135deg, ${(shown.colors ?? ["#440154", "#21918c", "#fde725"]).join(", ")})`
                                            : swatch(colors.color),
                                    }}
                                />
                            </span>
                            <span className="font-mono text-muted">
                                {shown.mode.replace("_vs_", " vs ")} · {shown.proj}
                            </span>
                        </div>
                    }
                >
                    The points are plotted with matplotlib in your colors and shape.
                </Step>
            </div>

            <div className="mt-20 grid items-center gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
                <div>
                    <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">A free API</h3>
                    <p className="mt-2 text-muted">
                        Every image here comes from a free API. This is the request for the image
                        above.
                    </p>
                    <a
                        href="/api/docs"
                        className="mt-4 inline-flex items-center gap-1.5 font-medium transition-opacity hover:opacity-70"
                    >
                        API docs <FiExternalLink size="0.9rem" aria-hidden />
                    </a>
                </div>
                <div className="overflow-hidden rounded-md border border-line bg-surface">
                    <div className="flex items-center justify-between border-b border-line px-3 py-1.5 text-xs text-muted">
                        <span>request</span>
                        <CopyIcon
                            value={curl}
                            label="copy command"
                            icon={<FiCopy size="0.9rem" />}
                        />
                    </div>
                    <pre className="px-4 py-3 font-mono text-[13px] leading-relaxed break-words whitespace-pre-wrap">
                        <span className="text-muted select-none">$ </span>
                        {breakable(curl)}
                    </pre>
                </div>
            </div>
        </section>
    );
}
