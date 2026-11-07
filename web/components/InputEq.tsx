import { NumberInput } from "@mantine/core";
import { MAX_EQ } from "../lib/api";

type EqProps = {
    eq: number;
    setEq: (eq: number) => void;
};

export default function InputEq({ eq, setEq }: EqProps) {
    return (
        <NumberInput
            label="variation"

            value={eq}
            min={0}
            max={MAX_EQ}
            allowDecimal={false}
            allowNegative={false}
            clampBehavior="strict"
            onChange={(value) => {
                if (typeof value === "number") {
                    setEq(value);
                }
            }}
        />
    );
}
