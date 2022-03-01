import React from "react";
import { NumberInput } from "@mantine/core";

type EqProps = {
    eq: number;
    setEq: React.Dispatch<React.SetStateAction<number>>;
};

export default function InputEq({ eq, setEq }: EqProps) {
    return (
        <div className="pt-2">
            <p className="font-light">variation</p>
            <NumberInput
                defaultValue={eq}
                min={1}
                max={30}
                radius="xs"
                onChange={(eq: number) => setEq(eq)}
            />
        </div>
    );
}
