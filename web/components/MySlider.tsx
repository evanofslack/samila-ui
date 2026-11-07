import { ReactNode } from "react";
import { Slider } from "@mantine/core";
import { Label } from "./Info";

type SliderProps = {
    title: string;
    info?: ReactNode;
    // beside the value, e.g. a badge or a reset button
    extra?: ReactNode;
    value: number;
    setValue: (value: number) => void;
    min: number;
    max: number;
    step: number;
    format: (value: number) => string;
};

export default function MySlider({
    title,
    info,
    extra,
    value,
    setValue,
    min,
    max,
    step,
    format,
}: SliderProps) {
    return (
        <div className="w-full">
            <div className="mb-1 flex min-h-6 items-center justify-between gap-2 text-sm">
                <span className="font-medium">
                    <Label text={title} info={info} />
                </span>
                <span className="flex items-center gap-1.5 text-muted tabular-nums">
                    {extra}
                    {format(value)}
                </span>
            </div>
            <Slider
                value={value}
                onChange={setValue}
                min={min}
                max={max}
                step={step}
                label={format}
                thumbLabel={title}
            />
        </div>
    );
}
