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
