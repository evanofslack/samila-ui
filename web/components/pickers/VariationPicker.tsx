import { useState } from "react";
import {
    ActionIcon,
    Drawer,
    NumberInput,
    Popover,
    SegmentedControl,
    Select,
    Tooltip,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { FiChevronLeft, FiChevronRight, FiShuffle } from "react-icons/fi";
import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";
import { GeneratorParams } from "../../interfaces";
import useRandomEquations from "../../hooks/useRandomEquations";
import { MAX_SEED } from "../../lib/api";
import { randomInt } from "../../lib/random";
import { randomSeed } from "../../lib/randomize";
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

type EquationsProps = {
    value: Variation & Pick<GeneratorParams, "fseed">;
    onChange: (value: Partial<GeneratorParams>) => void;
};

const FUNCTION_OPTIONS = EQUATIONS.map((e) => ({
    value: String(e.id),
    label: `${e.id} · ${e.display}`,
}));

function FormulaLines({ f1, f2 }: { f1: string; f2: string }) {
    return (
        <div className="min-w-0 font-mono text-xs leading-relaxed text-muted">
            <p className="truncate" title={f1}>
                <span className="text-ink">f₁</span> = {f1}
            </p>
            <p className="truncate" title={f2}>
                <span className="text-ink">f₂</span> = {f2}
            </p>
        </div>
    );
}

// the two equations of a variation, as f₁ and f₂
export function Formulas({ f1, f2 }: { f1: number; f2: number }) {
    return <FormulaLines f1={EQUATIONS[f1].display} f2={EQUATIONS[f2].display} />;
}

// the two equations samila writes for a function seed
export function RandomFormulas({ fseed }: { fseed: number }) {
    const equations = useRandomEquations(fseed);
    return <FormulaLines f1={equations?.f1 ?? "…"} f2={equations?.f2 ?? "…"} />;
}

// any image's equations: a variation's, or samila's own
export function ShownFormulas({ f1, f2, fseed }: Pick<GeneratorParams, "f1" | "f2" | "fseed">) {
    return fseed !== null ? <RandomFormulas fseed={fseed} /> : <Formulas f1={f1} f2={f2} />;
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
        // width and height give the image its square shape before it loads, and it loads
        // eagerly: firefox collapsed the lazy, unsized thumbnails into thin lines
        <img
            src={thumbnail(eq)}
            alt=""
            width={120}
            height={120}
            className={`${size} block shrink-0 rounded-sm bg-[#141a2a]`}
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
                className={`grid ${columns} max-h-[min(360px,50svh)] auto-rows-min content-start gap-2 overflow-y-auto p-1`}
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
                        className={`relative block overflow-hidden rounded-sm outline-offset-2 transition-[outline-color] ${
                            value.eq === eq
                                ? "outline-2 outline-ink"
                                : "outline-2 outline-transparent hover:outline-line-strong"
                        }`}
                    >
                        <Thumb {...fromEq(eq)} size="aspect-square h-auto w-full" />
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

function RandomPicker({ fseed, onChange }: { fseed: number; onChange: (fseed: number) => void }) {
    return (
        <div className="flex flex-col gap-2 rounded-sm border border-line p-2">
            <div className="flex items-center gap-1.5">
                <NumberInput
                    aria-label="equation seed"
                    value={fseed}
                    min={0}
                    max={MAX_SEED}
                    allowDecimal={false}
                    allowNegative={false}
                    clampBehavior="strict"
                    hideControls
                    size="xs"
                    className="flex-1"
                    classNames={{ input: "font-mono" }}
                    onChange={(value) => typeof value === "number" && onChange(value)}
                />
                <Tooltip label="new equations" withArrow>
                    <ActionIcon
                        variant="default"
                        size="input-xs"
                        aria-label="roll new equations"
                        onClick={() => onChange(randomSeed())}
                    >
                        <GiPerspectiveDiceSixFacesRandom size="1.1rem" />
                    </ActionIcon>
                </Tooltip>
            </div>
            <RandomFormulas fseed={fseed} />
        </div>
    );
}

export default function VariationPicker({ value, onChange }: EquationsProps) {
    const [open, setOpen] = useState(false);
    const phone = useMediaQuery("(max-width: 1023px)");
    const random = value.fseed !== null;

    // stepping from a hand-picked pair starts from the nearest numbered variation
    const step = (delta: number) => {
        if (value.fseed !== null) {
            onChange({ fseed: (value.fseed + delta + MAX_SEED + 1) % (MAX_SEED + 1) });
            return;
        }
        const from = value.eq ?? 0;
        onChange(fromEq((from + delta + MAX_EQ + 1) % (MAX_EQ + 1)));
    };

    const shuffle = () =>
        onChange(random ? { fseed: randomSeed() } : fromEq(randomInt(MAX_EQ + 1)));

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
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm font-medium">
                <Label
                    text={random ? "random equations" : "variation"}
                    info={random ? INFO.random : INFO.variation}
                />
                <span className="flex items-center">
                    <Tooltip label="previous" withArrow>
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="sm"
                            aria-label="previous"
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
                            aria-label="next"
                            onClick={() => step(1)}
                        >
                            <FiChevronRight />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="shuffle" withArrow>
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="sm"
                            aria-label={random ? "random equations" : "random variation"}
                            onClick={shuffle}
                        >
                            <FiShuffle size="0.85rem" />
                        </ActionIcon>
                    </Tooltip>
                </span>
            </div>
            <SegmentedControl
                fullWidth
                size="xs"
                value={random ? "random" : "variations"}
                onChange={(mode) => onChange({ fseed: mode === "random" ? randomSeed() : null })}
                data={["variations", "random"]}
                aria-label="where the equations come from"
            />
            {random && value.fseed !== null ? (
                <RandomPicker fseed={value.fseed} onChange={(fseed) => onChange({ fseed })} />
            ) : phone ? (
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
