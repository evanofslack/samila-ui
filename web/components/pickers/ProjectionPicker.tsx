import { ReactNode } from "react";
import { PROJECTIONS } from "../../lib/api";
import { INFO, Label } from "../Info";
import OptionTile from "./OptionTile";

// small line drawings of each projection's outline and grid
const ICONS: Record<string, ReactNode> = {
    rectilinear: (
        <>
            <rect x="3" y="3" width="18" height="18" rx="1" />
            <path d="M3 12h18M12 3v18" />
        </>
    ),
    polar: (
        <>
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="4.5" />
            <path d="M12 3v18M3 12h18" />
        </>
    ),
    hammer: (
        <>
            <ellipse cx="12" cy="12" rx="10" ry="6.5" />
            <path d="M2 12h20M12 5.5c-3 2-3 11 0 13M12 5.5c3 2 3 11 0 13" />
        </>
    ),
    aitoff: (
        <>
            <ellipse cx="12" cy="12" rx="10" ry="6" />
            <path d="M2 12h20M12 6v12M7 7c-2 2.5-2 7.5 0 10M17 7c2 2.5 2 7.5 0 10" />
        </>
    ),
    lambert: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12c4-3 14-3 18 0M12 3c-3 4-3 14 0 18" />
        </>
    ),
    mollweide: (
        <>
            <ellipse cx="12" cy="12" rx="10" ry="6" />
            <path d="M2.8 9h18.4M2.8 15h18.4M2 12h20" />
        </>
    ),
};

type ProjectionProps = {
    value: string;
    onChange: (proj: string) => void;
};

export default function ProjectionPicker({ value, onChange }: ProjectionProps) {
    return (
        <div>
            <div className="mb-1 text-sm font-medium">
                <Label text="projection" info={INFO.projection} />
            </div>
            <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="projection">
                {PROJECTIONS.map((proj) => (
                    <OptionTile
                        key={proj}
                        label={proj}
                        selected={value === proj}
                        onClick={() => onChange(proj)}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className="size-6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.25"
                            aria-hidden
                        >
                            {ICONS[proj]}
                        </svg>
                    </OptionTile>
                ))}
            </div>
        </div>
    );
}
