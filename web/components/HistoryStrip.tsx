import { GeneratedImage } from "../interfaces";
import { variationLabel } from "../lib/variations";

type HistoryProps = {
    history: GeneratedImage[];
    current: GeneratedImage | null;
    onRestore: (entry: GeneratedImage) => void;
};

// the last few renders, newest first; clicking one shows it again with its settings
export default function HistoryStrip({ history, current, onRestore }: HistoryProps) {
    if (history.length < 2) {
        return null;
    }
    return (
        <div className="mt-1">
            <p className="mb-1.5 text-xs text-muted">recent</p>
            <div
                className="-mx-1 flex [scrollbar-width:none] gap-2 overflow-x-auto [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)] px-1 pt-1 pb-2"
                role="list"
            >
                {history.map((entry) => {
                    const active = entry.url === current?.url;
                    return (
                        <button
                            key={entry.url}
                            type="button"
                            role="listitem"
                            aria-current={active}
                            aria-label={`show variation ${variationLabel(entry.params)}, seed ${entry.params.seed}`}
                            onClick={() => onRestore(entry)}
                            className={`size-14 shrink-0 overflow-hidden rounded-sm border transition ${
                                active
                                    ? "border-ink outline-2 outline-offset-2 outline-ink"
                                    : "border-line opacity-80 hover:opacity-100"
                            }`}
                        >
                            <img src={entry.url} alt="" className="size-full object-cover" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
