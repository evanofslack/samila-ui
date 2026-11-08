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
        <Popover width={220} position="top" withArrow shadow="md">
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
    seed: "The same seed always makes the same image.",
    variation: "The pair of equations that shapes the image.",
    axes: "Which values go on each axis.",
    projection: "How the plot is drawn, flat or curved.",
    colormap: "Colors each point along a gradient.",
    spot: "How big each point is.",
    opacity: "How see-through each point is.",
    resolution: "Image size in pixels. Bigger takes longer.",
    random: "Samila writes two new equations from this number.",
    range: "How far the grid of points reaches.",
    detail: "More points look smoother but take longer.",
    linewidth: "How thick each marker's outline is.",
    shape: "The image's width to height.",
};
