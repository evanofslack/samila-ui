import { ColorInput as MantineColorInput } from "@mantine/core";

const SWATCHES = ["#000000", "#ffffff", "#1d3557", "#e63946", "#f4a261", "#2a9d8f"];

type ColorProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    description?: string;
};

// a colour can also be one of samila's names, shown in place of a value
export default function ColorInput({ label, value, onChange, disabled, description }: ColorProps) {
    const named = !value.startsWith("#");
    return (
        <MantineColorInput
            label={label}
            description={description}
            value={named ? "" : value}
            placeholder={named ? value : undefined}
            onChange={onChange}
            disabled={disabled || named}
            format="hex"
            swatches={SWATCHES}
            swatchesPerRow={6}
            withEyeDropper={false}
            className="min-w-0 flex-1"
        />
    );
}
