/**
 * Convert a string to title case, that is, the first letter of each word
 * is capitalized.
 * @param s String to convert
 * @returns String converted to title case
 */
export function toTitleCase(s: string): string {
    return s.toLowerCase()
            .split(' ')
            .map(wd => wd.charAt(0).toUpperCase + wd.slice(1))
            .join(' ');
}

/**
 * Round a number `n` to the nearest multiple of `base`.
 * 
 * For example, when `n=42` and `base=10`, the output will be `40`.
 * @param x     Number to be rounded
 * @param base  Integer base, the closest multiple of which to `n` will be
 *              the output
 * @returns     The number `n` rounded to the nearest multiple of `base`
 */
export function roundToBase(x: number, base: number): number {
    if (base <= 0) {
        throw new Error("Base must be greater than 0");
    }

    return Math.round(x / base) * base;
}

export function squeeze(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}
