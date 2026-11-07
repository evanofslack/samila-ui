import { useEffect, useState } from "react";
import { autoSize, estimateMB, SIZE } from "../lib/api";
import MySlider from "./MySlider";

type ResolutionProps = {
    size: number | null;
    setSize: (size: number | null) => void;
};

// the slider's first stop is auto; the rest are pixel sizes
const AUTO = SIZE.min - SIZE.step;

function describe(size: number): string {
    return `${size} × ${size} px · ~${estimateMB(size)} MB`;
}

export default function Resolution({ size, setSize }: ResolutionProps) {
    // auto depends on the screen, so it's only known after mount
    const [auto, setAuto] = useState<number | null>(null);

    useEffect(() => {
        const measure = () => setAuto(autoSize());
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, []);

    return (
        <MySlider
            title="resolution"
            value={size ?? AUTO}
            setValue={(value) => setSize(value === AUTO ? null : value)}
            min={AUTO}
            max={SIZE.max}
            step={SIZE.step}
            format={(value) =>
                value === AUTO
                    ? `auto${auto === null ? "" : ` · ${describe(auto)}`}`
                    : describe(value)
            }
        />
    );
}
