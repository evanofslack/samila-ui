import { ReactNode } from "react";
import { MARKERS } from "../../lib/api";
import OptionTile from "./OptionTile";

// matplotlib's marker shapes, drawn in a 20×20 box
const filled = (d: string) => <path d={d} fill="currentColor" />;
const stroked = (d: string) => (
    <path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
);

function polygon(sides: number, r: number, rotate = 0): string {
    const points = Array.from({ length: sides }, (_, i) => {
        const a = (rotate + (360 / sides) * i - 90) * (Math.PI / 180);
        return `${(10 + r * Math.cos(a)).toFixed(2)},${(10 + r * Math.sin(a)).toFixed(2)}`;
    });
    return `M${points.join("L")}Z`;
}

function star(r: number, inner: number): string {
    const points = Array.from({ length: 10 }, (_, i) => {
        const a = (36 * i - 90) * (Math.PI / 180);
        const radius = i % 2 === 0 ? r : inner;
        return `${(10 + radius * Math.cos(a)).toFixed(2)},${(10 + radius * Math.sin(a)).toFixed(2)}`;
    });
    return `M${points.join("L")}Z`;
}

const GLYPHS: Record<string, ReactNode> = {
    point: <circle cx="10" cy="10" r="2.2" fill="currentColor" />,
    pixel: <rect x="9" y="9" width="2" height="2" fill="currentColor" />,
    circle: <circle cx="10" cy="10" r="6" fill="currentColor" />,
    triangle_down: filled(polygon(3, 7, 180)),
    triangle_up: filled(polygon(3, 7)),
    triangle_left: filled(polygon(3, 7, 270)),
    triangle_right: filled(polygon(3, 7, 90)),
    tri_down: stroked("M10 10v7M10 10l-6-3.5M10 10l6-3.5"),
    tri_up: stroked("M10 10V3M10 10l-6 3.5M10 10l6 3.5"),
    tri_left: stroked("M10 10H3M10 10l3.5-6M10 10l3.5 6"),
    tri_right: stroked("M10 10h7M10 10L6.5 4M10 10l-3.5 6"),
    octagon: filled(polygon(8, 7, 22.5)),
    square: <rect x="4" y="4" width="12" height="12" fill="currentColor" />,
    pentagon: filled(polygon(5, 7)),
    plus: stroked("M10 3v14M3 10h14"),
    plus_filled: filled("M8 3h4v5h5v4h-5v5H8v-5H3V8h5z"),
    star: filled(star(7.5, 3.2)),
    hexagon_vertical: filled(polygon(6, 7)),
    hexagon_horizontal: filled(polygon(6, 7, 30)),
    x: stroked("M4.5 4.5l11 11M15.5 4.5l-11 11"),
    x_filled: filled(
        "M5.5 3L10 7.5 14.5 3 17 5.5 12.5 10 17 14.5 14.5 17 10 12.5 5.5 17 3 14.5 7.5 10 3 5.5z",
    ),
    diamond: filled("M10 2.5l7.5 7.5-7.5 7.5L2.5 10z"),
    diamon_thin: filled("M10 2.5l4.5 7.5-4.5 7.5L5.5 10z"),
    vline: stroked("M10 3v14"),
    hline: stroked("M3 10h14"),
};

type MarkerProps = {
    value: string;
    onChange: (marker: string) => void;
};

export default function MarkerPicker({ value, onChange }: MarkerProps) {
    const current = MARKERS.find((m) => m.value === value);
    return (
        <div>
            <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium">marker</span>
                <span className="text-muted">{current?.label}</span>
            </div>
            <div className="grid grid-cols-7 gap-1" role="group" aria-label="marker">
                {MARKERS.map((m) => (
                    <OptionTile
                        key={m.value}
                        label={m.label}
                        selected={value === m.value}
                        onClick={() => onChange(m.value)}
                        showLabel={false}
                    >
                        <svg viewBox="0 0 20 20" className="size-5" aria-hidden>
                            {GLYPHS[m.value]}
                        </svg>
                    </OptionTile>
                ))}
            </div>
        </div>
    );
}
