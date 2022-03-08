import React from "react";
import { Slider } from "@mantine/core";

type SliderProps = {
    lineweight: number;
    setLineweight: React.Dispatch<React.SetStateAction<number>>;
};

export default function LineweightSlider({ lineweight, setLineweight }: SliderProps) {
    return (
        <div className="font-light w-full">
            <p>Lineweight</p>
            <Slider
                defaultValue={10}
                value={lineweight}
                onChange={setLineweight}
                label={(value) => (value / 100).toFixed(2)}
                radius={0}
            />
        </div>
    );
}
