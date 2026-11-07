import { ReactNode } from "react";
import { ActionIcon, Popover } from "@mantine/core";
import { FiInfo } from "react-icons/fi";

type InfoProps = {
    label: string;
    children: ReactNode;
};

// opens on click rather than hover, so it works on touch screens too
export function Info({ label, children }: InfoProps) {
    return (
        <Popover width={260} position="top" withArrow shadow="md">
            <Popover.Target>
                <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="xs"
                    aria-label={`about ${label}`}
                    className="text-muted"
                >
                    <FiInfo size="0.8rem" />
                </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown className="text-sm leading-relaxed">{children}</Popover.Dropdown>
        </Popover>
    );
}

type LabelProps = {
    text: string;
    info?: ReactNode;
};

// an input label with an optional explanation beside it
export function Label({ text, info }: LabelProps) {
    return (
        <span className="inline-flex items-center gap-1">
            {text}
            {info && <Info label={text}>{info}</Info>}
        </span>
    );
}

// what each setting does, for the info buttons
export const INFO = {
    seed: "Every image starts from a random seed. The same seed and settings always give the same image, so a seed is how you come back to one.",
    variation:
        "Which pair of equations moves the points. Each variation is a different pair, so this changes the shape the most.",
    axes: "Which values are plotted against each other: f1 and f2 are the two equations, x1 and x2 a point's starting position, and index its place in the grid.",
    projection:
        "How the plot is drawn: flat (rectilinear), around a centre (polar), or onto one of matplotlib's map projections.",
    colormap: "Colour each point along a gradient by its value, instead of one line colour.",
    spot: "The size of each point. Small spots make fine threads; big ones fill shapes in.",
    opacity:
        "How see-through each point is. Low opacity shows density: where many points overlap, it builds up.",
    resolution:
        "The image's width and height. Auto matches your screen; bigger images take longer to render.",
};
