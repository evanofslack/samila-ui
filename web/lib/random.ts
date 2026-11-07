// a random integer in [0, max)
export function randomInt(max: number): number {
    return Math.floor(Math.random() * max);
}

// a shuffled copy, by Fisher–Yates
export function shuffle<T>(items: readonly T[]): T[] {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

// a random number in [min, max)
export function randomFloat(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

export function pick<T>(items: readonly T[]): T {
    return items[randomInt(items.length)];
}

// picks from weighted choices; the rest share the leftover weight evenly
export function pickWeighted<T>(favoured: [T, number][], rest: readonly T[]): T {
    let r = Math.random();
    for (const [item, weight] of favoured) {
        if (r < weight) {
            return item;
        }
        r -= weight;
    }
    return pick(rest);
}
