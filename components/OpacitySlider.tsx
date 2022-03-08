import React from "react";
import { Slider } from "@mantine/core";

type SliderProps = {
    opacity: number;
    setOpacity: React.Dispatch<React.SetStateAction<number>>;
};

export default function OpacitySlider({ opacity, setOpacity }: SliderProps) {
    return (
        <div className="font-light w-full">
            <p>Lineweight</p>
            <Slider
                defaultValue={10}
                value={opacity}
                onChange={setOpacity}
                label={(value) => (value / 100).toFixed(2)}
                radius={0}
            />
        </div>
    );
}
