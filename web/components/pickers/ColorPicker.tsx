import { useEffect, useRef, useState } from "react";
import { ActionIcon, Button, Chip, SegmentedControl, Select, Tooltip } from "@mantine/core";
import { FiPlus, FiRepeat, FiX } from "react-icons/fi";
import { GeneratorParams } from "../../interfaces";
import { CMAPS, complementHex, isGradient, isHex, resolvedColors } from "../../lib/api";
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

type Colors = Pick<GeneratorParams, "color" | "bg" | "cmap" | "colors">;

type ColorProps = {
    value: Colors;
    onChange: (value: Partial<Colors>) => void;
};

const CUSTOM_DEFAULT = ["#ff0066", "#ffcc00", "#00ccff"];
const MAX_STOPS = 4;

// every colormap the API takes; fetched once, the curated ones until then
let allCmaps: string[] | null = null;

function useAllColormaps(): string[] {
    const [names, setNames] = useState<string[]>(allCmaps ?? CMAPS);
    useEffect(() => {
        if (allCmaps) {
            return;
        }
        fetch("/api/colormaps")
            .then((resp) => (resp.ok ? resp.json() : null))
            .then((body) => {
                if (body?.all) {
                    allCmaps = body.all as string[];
                    setNames(allCmaps);
                }
            })
            .catch(() => {});
    }, []);
    return names;
}

function GradientTile({
    label,
    stops,
    selected,
    onClick,
}: {
    label: string;
    stops: string[];
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            aria-pressed={selected}
            onClick={onClick}
            className={`flex items-center gap-2 rounded-sm border p-1.5 text-left text-xs transition-colors ${
                selected
                    ? "border-ink bg-ink/5 text-ink"
                    : "border-line text-muted hover:border-line-strong hover:text-ink"
            }`}
        >
            <span
                className="h-3 w-10 shrink-0 rounded-xs"
                style={{ background: `linear-gradient(to right, ${stops.join(", ")})` }}
            />
            {label}
        </button>
    );
}

function CustomStops({
    colors,
    onChange,
}: {
    colors: string[];
    onChange: (colors: string[]) => void;
}) {
    return (
        <div className="flex flex-col gap-2">
            {colors.map((color, i) => (
                <div key={i} className="flex items-end gap-1.5">
                    <ColorInput
                        label={i === 0 ? "gradient colors" : ""}
                        value={color}
                        onChange={(c) => onChange(colors.map((old, j) => (j === i ? c : old)))}
                    />
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="input-sm"
                        aria-label={`remove color ${i + 1}`}
                        disabled={colors.length <= 2}
                        onClick={() => onChange(colors.filter((_, j) => j !== i))}
                    >
                        <FiX size="0.9rem" />
                    </ActionIcon>
                </div>
            ))}
            {colors.length < MAX_STOPS && (
                <Button
                    variant="subtle"
                    color="gray"
                    size="xs"
                    leftSection={<FiPlus />}
                    className="self-start"
                    onClick={() => onChange([...colors, colors[colors.length - 1]])}
                >
                    add color
                </Button>
            )}
        </div>
    );
}

export default function ColorPicker({ value, onChange }: ColorProps) {
    const gradient = isGradient(value);
    const allNames = useAllColormaps();
    // the last real background, for when transparent is turned off again
    const lastBg = useRef(isHex(value.bg) ? value.bg : "#ffffff");
    if (isHex(value.bg)) {
        lastBg.current = value.bg;
    }
    const resolved = resolvedColors(value);
    const transparent = value.bg === "transparent";
    const complement = value.color === "complement";

    const setMode = (mode: string) =>
        onChange(
            mode === "gradient"
                ? {
                      cmap: "viridis",
                      colors: null,
                      // a gradient has no single colour for the background to complement
                      bg: value.bg === "complement" ? resolved.bg : value.bg,
                  }
                : { cmap: null, colors: null },
        );

    return (
        <div className="flex flex-col gap-4">
            <SegmentedControl
                fullWidth
                size="xs"
                value={gradient ? "gradient" : "solid"}
                onChange={setMode}
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
                            disabled={!isHex(value.color) || !isHex(value.bg)}
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
            <div className="flex flex-wrap gap-1.5">
                {!gradient && (
                    <Chip
                        size="xs"
                        checked={complement}
                        disabled={!isHex(value.bg)}
                        onChange={(on) => onChange({ color: on ? "complement" : resolved.color })}
                    >
                        complement line
                    </Chip>
                )}
                <Chip
                    size="xs"
                    checked={transparent}
                    onChange={(on) =>
                        onChange({
                            bg: on ? "transparent" : lastBg.current,
                            // a complement needs a background colour to work from
                            ...(on && complement && { color: complementHex(lastBg.current) }),
                        })
                    }
                >
                    transparent background
                </Chip>
            </div>
            {gradient ? (
                <div className="flex flex-col gap-3">
                    <div>
                        <div className="mb-1 text-sm font-medium">
                            <Label text="colormap" info={INFO.colormap} />
                        </div>
                        <div
                            className="grid grid-cols-2 gap-1.5"
                            role="group"
                            aria-label="colormap"
                        >
                            {CMAPS.map((cmap) => (
                                <GradientTile
                                    key={cmap}
                                    label={cmap}
                                    stops={CMAP_STOPS[cmap]}
                                    selected={value.cmap === cmap}
                                    onClick={() => onChange({ cmap, colors: null })}
                                />
                            ))}
                            <GradientTile
                                label="custom"
                                stops={value.colors ?? CUSTOM_DEFAULT}
                                selected={value.colors !== null}
                                onClick={() =>
                                    onChange({ cmap: null, colors: value.colors ?? CUSTOM_DEFAULT })
                                }
                            />
                        </div>
                    </div>
                    {value.colors !== null ? (
                        <CustomStops
                            colors={value.colors}
                            onChange={(colors) => onChange({ colors })}
                        />
                    ) : (
                        <Select
                            label="all colormaps"
                            size="xs"
                            searchable
                            placeholder="search matplotlib colormaps"
                            data={allNames}
                            value={value.cmap && !CMAPS.includes(value.cmap) ? value.cmap : null}
                            onChange={(cmap) => cmap && onChange({ cmap, colors: null })}
                            limit={60}
                        />
                    )}
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
