import { ActionIcon, SegmentedControl, Tooltip } from "@mantine/core";
import { FiRepeat } from "react-icons/fi";
import { GeneratorParams } from "../../interfaces";
import { CMAPS } from "../../lib/api";
import { PALETTES } from "../../lib/presets";
import ColorInput from "../ColorInput";
import { INFO, Label } from "../Info";

// a few stops along each matplotlib colormap, enough to draw its swatch
const CMAP_STOPS: Record<string, string[]> = {
    viridis: ["#440154", "#3b528b", "#21918c", "#5ec962", "#fde725"],
    plasma: ["#0d0887", "#7e03a8", "#cc4778", "#f89540", "#f0f921"],
    inferno: ["#000004", "#57106e", "#bc3754", "#f98e09", "#fcffa4"],
    magma: ["#000004", "#51127c", "#b73779", "#fc8961", "#fcfdbf"],
    cividis: ["#00224e", "#434e6c", "#7d7c78", "#bcae6e", "#fee838"],
    twilight: ["#e2d9e2", "#6276ba", "#2f1436", "#a8463e", "#e2d9e2"],
    turbo: ["#30123b", "#28bbec", "#a2fc3c", "#fb8022", "#7a0403"],
    cool: ["#00ffff", "#ff00ff"],
    spring: ["#ff00ff", "#ffff00"],
    ocean: ["#008000", "#004040", "#000080", "#5c9dff", "#ffffff"],
};

type Colors = Pick<GeneratorParams, "color" | "bg" | "cmap">;

type ColorProps = {
    value: Colors;
    onChange: (value: Partial<Colors>) => void;
};

export default function ColorPicker({ value, onChange }: ColorProps) {
    const gradient = value.cmap !== null;

    return (
        <div className="flex flex-col gap-4">
            <SegmentedControl
                fullWidth
                size="xs"
                value={gradient ? "gradient" : "solid"}
                onChange={(mode) => onChange({ cmap: mode === "gradient" ? "viridis" : null })}
                data={["solid", "gradient"]}
                aria-label="colour mode"
            />
            <div className="flex flex-row items-end gap-2">
                {!gradient && (
                    <ColorInput
                        label="line"
                        value={value.color}
                        onChange={(color) => onChange({ color })}
                    />
                )}
                {!gradient && (
                    <Tooltip label="swap colours" withArrow>
                        <ActionIcon
                            variant="default"
                            size="input-sm"
                            aria-label="swap line and background"
                            onClick={() => onChange({ color: value.bg, bg: value.color })}
                        >
                            <FiRepeat size="0.9rem" />
                        </ActionIcon>
                    </Tooltip>
                )}
                <ColorInput
                    label="background"
                    value={value.bg}
                    onChange={(bg) => onChange({ bg })}
                />
            </div>
            {gradient ? (
                <div>
                    <div className="mb-1 text-sm font-medium">
                        <Label text="colormap" info={INFO.colormap} />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="colormap">
                        {CMAPS.map((cmap) => (
                            <button
                                key={cmap}
                                type="button"
                                aria-pressed={value.cmap === cmap}
                                onClick={() => onChange({ cmap })}
                                className={`flex items-center gap-2 rounded-sm border p-1.5 text-left text-xs transition-colors ${
                                    value.cmap === cmap
                                        ? "border-ink bg-ink/5 text-ink"
                                        : "border-line text-muted hover:border-line-strong hover:text-ink"
                                }`}
                            >
                                <span
                                    className="h-3 w-10 shrink-0 rounded-xs"
                                    style={{
                                        background: `linear-gradient(to right, ${CMAP_STOPS[cmap].join(", ")})`,
                                    }}
                                />
                                {cmap}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div>
                    <div className="mb-1 text-sm font-medium">palettes</div>
                    <div className="flex flex-wrap gap-1.5" role="group" aria-label="palettes">
                        {PALETTES.map((p) => {
                            const selected = p.color === value.color && p.bg === value.bg;
                            return (
                                <Tooltip key={p.name} label={p.name} withArrow openDelay={300}>
                                    <button
                                        type="button"
                                        aria-label={p.name}
                                        aria-pressed={selected}
                                        onClick={() => onChange({ color: p.color, bg: p.bg })}
                                        className={`relative size-7 overflow-hidden rounded-full border transition-transform hover:scale-110 ${
                                            selected
                                                ? "border-ink ring-2 ring-ink ring-offset-2 ring-offset-surface"
                                                : "border-line"
                                        }`}
                                        style={{ background: p.bg }}
                                    >
                                        <span
                                            className="absolute inset-[30%] rounded-full"
                                            style={{ background: p.color }}
                                        />
                                    </button>
                                </Tooltip>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
