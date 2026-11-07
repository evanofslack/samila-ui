import { Slider } from "@mantine/core";

type SliderProps = {
    title: string;
    value: number;
    setValue: (value: number) => void;
    min: number;
    max: number;
    step: number;
    format: (value: number) => string;
};

export default function MySlider({ title, value, setValue, min, max, step, format }: SliderProps) {
    return (
        <div className="w-full">
            <div className="flex justify-between text-sm">
                <span>{title}</span>
                <span className="text-gray-500 tabular-nums">{format(value)}</span>
            </div>
            <Slider
                value={value}
                onChange={setValue}
                min={min}
                max={max}
                step={step}
                label={format}
                thumbLabel={title}
                color="dark"
            />
        </div>
    );
}
