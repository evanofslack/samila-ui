import { Accordion, Select } from "@mantine/core";
import { GeneratorParams } from "../interfaces";
import { ALPHA, CMAPS, MARKERS, MODES, ROTATION, SPOT } from "../lib/api";
import MySlider from "./MySlider";

type AdvancedProps = {
    params: GeneratorParams;
    update: <K extends keyof GeneratorParams>(key: K, value: GeneratorParams[K]) => void;
};

const NO_CMAP = "none";
const CMAP_OPTIONS = [
    { value: NO_CMAP, label: "none (single colour)" },
    ...CMAPS.map((c) => ({ value: c, label: c })),
];

// spot size spans three decades, so its slider runs on a log scale from 0 to 100
const SPOT_DECADES = Math.log10(SPOT.max / SPOT.min);

function spotToSlider(spot: number): number {
    return (Math.log10(spot / SPOT.min) / SPOT_DECADES) * 100;
}

function sliderToSpot(value: number): number {
    return Number((SPOT.min * 10 ** ((value / 100) * SPOT_DECADES)).toPrecision(2));
}

export default function Advanced({ params, update }: AdvancedProps) {
    return (
        <Accordion variant="contained" className="w-full">
            <Accordion.Item value="advanced">
                <Accordion.Control>advanced</Accordion.Control>
                <Accordion.Panel>
                    <div className="flex flex-col gap-3">
                        <Select
                            label="generate mode"
                            data={MODES}
                            value={params.mode}
                            allowDeselect={false}
                            onChange={(value) => value && update("mode", value)}
                        />
                        <Select
                            label="marker"
                            data={MARKERS}
                            value={params.marker}
                            allowDeselect={false}
                            onChange={(value) => value && update("marker", value)}
                        />
                        <Select
                            label="colormap"
                            data={CMAP_OPTIONS}
                            value={params.cmap ?? NO_CMAP}
                            allowDeselect={false}
                            onChange={(value) =>
                                update("cmap", value && value !== NO_CMAP ? value : null)
                            }
                        />
                        <MySlider
                            title="spot size"
                            value={spotToSlider(params.spot)}
                            setValue={(value) => update("spot", sliderToSpot(value))}
                            min={0}
                            max={100}
                            step={1}
                            format={(value) => String(sliderToSpot(value))}
                        />
                        <MySlider
                            title="alpha"
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
                    </div>
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    );
}
