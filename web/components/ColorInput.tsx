type ColorProps = {
    color: string;
    title: string;
    active: boolean;
    onSelect: () => void;
};

// a swatch that picks which colour the picker edits
export default function ColorInput({ color, title, active, onSelect }: ColorProps) {
    return (
        <button
            type="button"
            className="flex cursor-pointer flex-row items-center p-1"
            aria-pressed={active}
            aria-label={`edit ${title} colour`}
            onClick={onSelect}
        >
            <span className={`pr-2 ${active ? "font-normal underline" : "font-light"}`}>
                {title}
            </span>
            <span className="h-8 w-8 border border-black" style={{ backgroundColor: color }} />
        </button>
    );
}
