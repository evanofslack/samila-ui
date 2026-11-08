import { ActionIcon, NumberInput, Tooltip } from "@mantine/core";
import { FiLock, FiUnlock } from "react-icons/fi";
import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";
import { MAX_SEED } from "../../lib/api";
import { randomSeed } from "../../lib/randomize";
import { INFO, Label } from "../Info";

type SeedProps = {
    seed: number | null;
    setSeed: (seed: number) => void;
    locked: boolean;
    setLocked: (locked: boolean) => void;
};

export default function SeedField({ seed, setSeed, locked, setLocked }: SeedProps) {
    return (
        <div className="flex items-end gap-1.5">
            <NumberInput
                label={<Label text="seed" info={INFO.seed} />}
                value={seed ?? ""}
                min={0}
                max={MAX_SEED}
                allowDecimal={false}
                allowNegative={false}
                clampBehavior="strict"
                hideControls
                className="flex-1"
                classNames={{ input: "font-mono" }}
                onChange={(value) => {
                    if (typeof value === "number") {
                        setSeed(value);
                    }
                }}
            />
            <Tooltip label="roll a seed" withArrow>
                <ActionIcon
                    variant="default"
                    size="input-sm"
                    aria-label="roll a new seed"
                    onClick={() => setSeed(randomSeed())}
                >
                    <GiPerspectiveDiceSixFacesRandom size="1.2rem" />
                </ActionIcon>
            </Tooltip>
            <Tooltip label={locked ? "seed locked: new image keeps it" : "lock the seed"} withArrow>
                <ActionIcon
                    variant={locked ? "filled" : "default"}
                    size="input-sm"
                    aria-label="lock seed"
                    aria-pressed={locked}
                    onClick={() => setLocked(!locked)}
                >
                    {locked ? <FiLock size="1rem" /> : <FiUnlock size="1rem" />}
                </ActionIcon>
            </Tooltip>
        </div>
    );
}
