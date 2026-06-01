// Deterministic-friendly helpers used by the quiz engine.

/** Fisher–Yates shuffle. Returns a new array; does not mutate the input. */
export function shuffle<T>(input: readonly T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = arr[i]!;
    const b = arr[j]!;
    arr[i] = b;
    arr[j] = a;
  }
  return arr;
}

/** Pick up to `n` items at random (without replacement). */
export function sample<T>(input: readonly T[], n: number): T[] {
  return shuffle(input).slice(0, Math.max(0, n));
}
