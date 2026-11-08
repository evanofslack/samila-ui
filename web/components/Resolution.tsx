import { useEffect, useState } from "react";
import { ActionIcon, Badge, SegmentedControl, Tooltip } from "@mantine/core";
import { FiRotateCcw } from "react-icons/fi";
import { ASPECTS, autoSize, dimensions, estimateMB, SIZE } from "../lib/api";
import { INFO, Label } from "./Info";
import MySlider from "./MySlider";

type ResolutionProps = {
    size: number | null;
    setSize: (size: number | null) => void;
    aspect: number;
    setAspect: (aspect: number) => void;
};

// a link can carry any shape; the control shows the nearest preset
function nearestAspect(aspect: number): string {
    const best = ASPECTS.reduce((a, b) =>
        Math.abs(Math.log(b.value / aspect)) < Math.abs(Math.log(a.value / aspect)) ? b : a,
    );
    return best.label;
}

// on auto the thumb sits at the size auto picks; dragging it sets a size, reset goes back
export default function Resolution({ size, setSize, aspect, setAspect }: ResolutionProps) {
    // auto depends on the screen, so it's only known after mount
    const [auto, setAuto] = useState(1000);

    useEffect(() => {
        const measure = () => setAuto(autoSize());
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, []);

    const describe = (long: number) => {
        const { width, height } = dimensions(long, aspect);
        return `${width} × ${height} · ~${estimateMB(width, height)} MB`;
    };

    return (
        <div className="flex flex-col gap-4">
            <div>
                <div className="mb-1 text-sm font-medium">
                    <Label text="shape" info={INFO.shape} />
                </div>
                <SegmentedControl
                    fullWidth
                    size="xs"
                    value={nearestAspect(aspect)}
                    onChange={(label) =>
                        setAspect(ASPECTS.find((a) => a.label === label)?.value ?? 1)
                    }
                    data={ASPECTS.map((a) => a.label)}
                    aria-label="image shape"
                />
            </div>
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
        </div>
    );
}
