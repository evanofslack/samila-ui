import { ReactNode, useEffect, useState } from "react";
import { Accordion, ActionIcon, Select, Tooltip } from "@mantine/core";
import { FiShuffle } from "react-icons/fi";
import { GeneratorParams } from "../../interfaces";
import { ALPHA, MODES, ROTATION, SPOT } from "../../lib/api";
import { randomColors, randomPoints, randomShape } from "../../lib/randomize";
import { INFO, Label } from "../Info";
import MySlider from "../MySlider";
import Resolution from "../Resolution";
import ColorPicker from "../pickers/ColorPicker";
import MarkerPicker from "../pickers/MarkerPicker";
import ProjectionPicker from "../pickers/ProjectionPicker";
import VariationPicker from "../pickers/VariationPicker";

export type Update = <K extends keyof GeneratorParams>(key: K, value: GeneratorParams[K]) => void;

type PanelProps = {
    params: GeneratorParams;
    update: Update;
    merge: (values: Partial<GeneratorParams>) => void;
};

const SECTIONS = ["shape", "color", "points", "output"];
// phones open the two sections that matter most, to keep the page short
const PHONE_SECTIONS = ["shape", "color"];

// spot size spans three decades, so its slider runs on a log scale from 0 to 100
const SPOT_DECADES = Math.log10(SPOT.max / SPOT.min);

function spotToSlider(spot: number): number {
    return (Math.log10(spot / SPOT.min) / SPOT_DECADES) * 100;
}

function sliderToSpot(value: number): number {
    return Number((SPOT.min * 10 ** ((value / 100) * SPOT_DECADES)).toPrecision(2));
}

type SectionProps = {
    value: string;
    title: string;
    onShuffle?: () => void;
    children: ReactNode;
};

function Section({ value, title, onShuffle, children }: SectionProps) {
    return (
        <Accordion.Item value={value}>
            <div className="flex items-center gap-1">
                <Accordion.Control className="flex-1">{title}</Accordion.Control>
                {onShuffle && (
                    <Tooltip label={`shuffle ${title}`} withArrow>
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            aria-label={`shuffle ${title}`}
                            onClick={onShuffle}
                        >
                            <FiShuffle size="0.9rem" />
                        </ActionIcon>
                    </Tooltip>
                )}
            </div>
            <Accordion.Panel>
                <div className="flex flex-col gap-4 pb-2">{children}</div>
            </Accordion.Panel>
        </Accordion.Item>
    );
}

export default function Panel({ params, update, merge }: PanelProps) {
    const [open, setOpen] = useState<string[]>(SECTIONS);

    useEffect(() => {
        if (window.matchMedia("(max-width: 1023px)").matches) {
            setOpen(PHONE_SECTIONS);
        }
    }, []);

    return (
        <Accordion
            multiple
            value={open}
            onChange={setOpen}
            variant="default"
            chevronPosition="left"
            classNames={{
                control: "px-0 font-semibold",
                label: "py-3",
                content: "px-0",
                item: "border-line",
            }}
        >
            <Section value="shape" title="shape" onShuffle={() => merge(randomShape())}>
                <VariationPicker value={params} onChange={(variation) => merge(variation)} />
                <Select
                    label={<Label text="axes" info={INFO.axes} />}
                    data={MODES}
                    value={params.mode}
                    allowDeselect={false}
                    onChange={(value) => value && update("mode", value)}
                />
                <ProjectionPicker value={params.proj} onChange={(proj) => update("proj", proj)} />
            </Section>

            <Section value="color" title="color" onShuffle={() => merge(randomColors())}>
                <ColorPicker value={params} onChange={merge} />
            </Section>

            <Section value="points" title="points" onShuffle={() => merge(randomPoints())}>
                <MarkerPicker
                    value={params.marker}
                    onChange={(marker) => update("marker", marker)}
                />
                <MySlider
                    title="spot size"
                    info={INFO.spot}
                    value={spotToSlider(params.spot)}
                    setValue={(value) => update("spot", sliderToSpot(value))}
                    min={0}
                    max={100}
                    step={1}
                    format={(value) => String(sliderToSpot(value))}
                />
                <MySlider
                    title="opacity"
                    info={INFO.opacity}
                    value={params.alpha}
                    setValue={(alpha) => update("alpha", alpha)}
                    min={ALPHA.min}
                    max={ALPHA.max}
                    step={0.01}
                    format={(value) => value.toFixed(2)}
                />
                <MySlider
                    title="rotation"
                    value={params.rotation}
                    setValue={(rotation) => update("rotation", rotation)}
                    min={ROTATION.min}
                    max={ROTATION.max}
                    step={1}
                    format={(value) => `${value}°`}
                />
            </Section>

            <Section value="output" title="output">
                <Resolution size={params.size} setSize={(size) => update("size", size)} />
            </Section>
        </Accordion>
    );
}
