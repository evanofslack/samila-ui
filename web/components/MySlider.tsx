import React from "react";
import { Slider } from "@mantine/core";

type SliderProps = {
    title: string;
    value: number;
    setValue: React.Dispatch<React.SetStateAction<number>>;
};

export default function MySlider({ title, value, setValue }: SliderProps) {
    return (
        <div className="font-light w-full">
            <p>{title}</p>
            <Slider
                defaultValue={10}
                value={value}
                onChange={setValue}
                label={(value) => (value / 100).toFixed(2)}
                radius={0}
            />
        </div>
    );
}
