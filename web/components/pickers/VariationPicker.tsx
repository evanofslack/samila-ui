import { useState } from "react";
import { ActionIcon, Drawer, Popover, Select, Tooltip } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { FiChevronLeft, FiChevronRight, FiShuffle } from "react-icons/fi";
import { GeneratorParams } from "../../interfaces";
import { randomInt } from "../../lib/random";
import {
    EQUATIONS,
    fromEq,
    fromPair,
    MAX_EQ,
    PAIRS,
    thumbnail,
    variationLabel,
} from "../../lib/variations";
import { INFO, Label } from "../Info";

type Variation = Pick<GeneratorParams, "eq" | "f1" | "f2">;

type PickerProps = {
    value: Variation;
    onChange: (value: Variation) => void;
};

const FUNCTION_OPTIONS = EQUATIONS.map((e) => ({
    value: String(e.id),
    label: `${e.id} · ${e.display}`,
}));

// the two equations of a variation, as f₁ and f₂
export function Formulas({ f1, f2 }: { f1: number; f2: number }) {
    return (
        <div className="min-w-0 font-mono text-xs leading-relaxed text-muted">
            <p className="truncate" title={EQUATIONS[f1].display}>
                <span className="text-ink">f₁</span> = {EQUATIONS[f1].display}
            </p>
            <p className="truncate" title={EQUATIONS[f2].display}>
                <span className="text-ink">f₂</span> = {EQUATIONS[f2].display}
            </p>
        </div>
    );
}

function Thumb({ eq, f1, f2, size }: Variation & { size: string }) {
    if (eq === null) {
        // a hand-picked pair has no pre-rendered thumbnail
        return (
            <span
                className={`${size} flex shrink-0 items-center justify-center rounded-sm bg-[#141a2a] font-mono text-[10px] text-[#dfe3ee]`}
            >
                {f1} × {f2}
            </span>
        );
    }
    return (
        <img
            src={thumbnail(eq)}
            alt=""
            loading="lazy"
            className={`${size} shrink-0 rounded-sm bg-[#141a2a]`}
        />
    );
}

type GridProps = PickerProps & { columns: string; onPicked: () => void };

function PickerBody({ value, onChange, columns, onPicked }: GridProps) {
    const [hovered, setHovered] = useState<number | null>(null);
    const preview = hovered !== null ? fromEq(hovered) : value;

    return (
        <div className="flex flex-col gap-3">
            <div
                className={`grid ${columns} max-h-[min(360px,50svh)] gap-1.5 overflow-y-auto pr-1`}
                onMouseLeave={() => setHovered(null)}
            >
                {PAIRS.map((_, eq) => (
                    <button
                        key={eq}
                        type="button"
                        aria-label={`variation ${eq}`}
                        aria-pressed={value.eq === eq}
                        onMouseEnter={() => setHovered(eq)}
                        onFocus={() => setHovered(eq)}
                        onClick={() => {
                            onChange(fromEq(eq));
                            onPicked();
                        }}
                        className={`relative overflow-hidden rounded-sm border-2 transition-colors ${
                            value.eq === eq
                                ? "border-ink"
                                : "border-transparent hover:border-line-strong"
                        }`}
                    >
                        <Thumb {...fromEq(eq)} size="aspect-square w-full" />
                        <span className="absolute bottom-0.5 left-1 font-mono text-[10px] text-white/80">
                            {eq}
                        </span>
                    </button>
                ))}
            </div>
            <div className="border-t border-line pt-3">
                <p className="mb-1 text-xs text-muted">variation {variationLabel(preview)}</p>
                <Formulas f1={preview.f1} f2={preview.f2} />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <Select
                    label="f₁"
                    size="xs"
                    data={FUNCTION_OPTIONS}
                    value={String(value.f1)}
                    allowDeselect={false}
                    comboboxProps={{ withinPortal: false }}
                    onChange={(f1) => f1 !== null && onChange(fromPair(Number(f1), value.f2))}
                />
                <Select
                    label="f₂"
                    size="xs"
                    data={FUNCTION_OPTIONS}
                    value={String(value.f2)}
                    allowDeselect={false}
                    comboboxProps={{ withinPortal: false }}
                    onChange={(f2) => f2 !== null && onChange(fromPair(value.f1, Number(f2)))}
                />
            </div>
        </div>
    );
}

export default function VariationPicker({ value, onChange }: PickerProps) {
    const [open, setOpen] = useState(false);
    const phone = useMediaQuery("(max-width: 1023px)");

    // stepping from a hand-picked pair starts from the nearest numbered variation
    const step = (delta: number) => {
        const from = value.eq ?? 0;
        onChange(fromEq((from + delta + MAX_EQ + 1) % (MAX_EQ + 1)));
    };

    const trigger = (
        <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label="choose a variation"
            className="flex w-full items-center gap-3 rounded-sm border border-line p-1.5 text-left transition-colors hover:border-line-strong"
        >
            <Thumb {...value} size="size-14" />
            <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm">
                    {value.eq === null ? "custom pair" : `variation ${value.eq}`}
                </span>
                <Formulas f1={value.f1} f2={value.f2} />
            </span>
        </button>
    );

    const body = (
        <PickerBody
            value={value}
            onChange={onChange}
            columns={phone ? "grid-cols-4" : "grid-cols-5"}
            onPicked={() => setOpen(false)}
        />
    );

    return (
        <div>
            <div className="mb-1 flex items-center justify-between text-sm font-medium">
                <Label text="variation" info={INFO.variation} />
                <span className="flex items-center">
                    <Tooltip label="previous" withArrow>
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="sm"
                            aria-label="previous variation"
                            onClick={() => step(-1)}
                        >
                            <FiChevronLeft />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="next" withArrow>
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="sm"
                            aria-label="next variation"
                            onClick={() => step(1)}
                        >
                            <FiChevronRight />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="random variation" withArrow>
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="sm"
                            aria-label="random variation"
                            onClick={() => onChange(fromEq(randomInt(MAX_EQ + 1)))}
                        >
                            <FiShuffle size="0.85rem" />
                        </ActionIcon>
                    </Tooltip>
                </span>
            </div>
            {phone ? (
                <>
                    {trigger}
                    <Drawer
                        opened={open}
                        onClose={() => setOpen(false)}
                        position="bottom"
                        size="auto"
                        title="variation"
                        classNames={{ content: "rounded-t-lg" }}
                    >
                        {body}
                    </Drawer>
                </>
            ) : (
                <Popover
                    opened={open}
                    onChange={setOpen}
                    position="left-start"
                    width={480}
                    shadow="lg"
                    withArrow
                >
                    <Popover.Target>{trigger}</Popover.Target>
                    <Popover.Dropdown>{body}</Popover.Dropdown>
                </Popover>
            )}
        </div>
    );
}
