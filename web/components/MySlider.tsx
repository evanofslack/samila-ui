import { Slider } from "@mantine/core";

type SliderProps = {
    title: string;
    value: number;
    setValue: (value: number) => void;
    min: number;
    max: number;
    step: number;
};

export default function MySlider({ title, value, setValue, min, max, step }: SliderProps) {
    return (
        <div className="w-full font-light">
            <p>{title}</p>
            <Slider
                value={value}
                onChange={setValue}
                min={min}
                max={max}
                step={step}
                label={(v) => v.toFixed(2)}
                thumbLabel={title}
                color="dark"
            />
        </div>
    );
}
