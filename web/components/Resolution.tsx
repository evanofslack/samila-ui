import { useEffect, useState } from "react";
import { ActionIcon, Badge, Tooltip } from "@mantine/core";
import { FiRotateCcw } from "react-icons/fi";
import { autoSize, estimateMB, SIZE } from "../lib/api";
import { INFO } from "./Info";
import MySlider from "./MySlider";

type ResolutionProps = {
    size: number | null;
    setSize: (size: number | null) => void;
};

function describe(size: number): string {
    return `${size} px · ~${estimateMB(size)} MB`;
}

// on auto the thumb sits at the size auto picks; dragging it sets a size, reset goes back
export default function Resolution({ size, setSize }: ResolutionProps) {
    // auto depends on the screen, so it's only known after mount
    const [auto, setAuto] = useState(1000);

    useEffect(() => {
        const measure = () => setAuto(autoSize());
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, []);

    return (
        <MySlider
            title="resolution"
            info={INFO.resolution}
            value={size ?? auto}
            setValue={setSize}
            min={SIZE.min}
            max={SIZE.max}
            step={SIZE.step}
            format={describe}
            extra={
                size === null ? (
                    <Badge size="xs" variant="light" color="gray">
                        auto
                    </Badge>
                ) : (
                    <Tooltip label="back to auto" withArrow>
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="xs"
                            aria-label="back to auto resolution"
                            onClick={() => setSize(null)}
                        >
                            <FiRotateCcw size="0.75rem" />
                        </ActionIcon>
                    </Tooltip>
                )
            }
        />
    );
}
