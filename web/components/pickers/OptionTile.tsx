import { ReactNode } from "react";

type TileProps = {
    selected: boolean;
    label: string;
    onClick: () => void;
    children: ReactNode;
    // show the label under the icon, or only as a tooltip-style title
    showLabel?: boolean;
};

// a toggle button in a grid of choices; the chosen one gets a darker border
export default function OptionTile({
    selected,
    label,
    onClick,
    children,
    showLabel = true,
}: TileProps) {
    return (
        <button
            type="button"
            aria-pressed={selected}
            aria-label={showLabel ? undefined : label}
            title={showLabel ? undefined : label}
            onClick={onClick}
            className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-sm border px-1 py-2 text-xs transition-colors ${
                selected
                    ? "border-ink bg-ink/5 text-ink"
                    : "border-line text-muted hover:border-line-strong hover:text-ink"
            }`}
        >
            {children}
            {showLabel && <span className="max-w-full truncate">{label}</span>}
        </button>
    );
}
