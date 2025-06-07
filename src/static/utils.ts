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

export function getSVGPoint(svg: SVGSVGElement, x: number, y: number): 
    {x: number, y: number} {
    // Convert client coordinates to SVG coordinates
    const invCTM = svg.getScreenCTM()!.inverse();
    const pt = svg.createSVGPoint();
    pt.x = x;
    pt.y = y;
    const domPoint = pt.matrixTransform(invCTM);
    return ({ x: domPoint.x, y: domPoint.y });
}

/**
 * Test if a string is an integer value
 * @param s String to be tested
 * @returns `true` if all characters in the string are numeric (i.e., `0`-`9`),
 *          `false` otherwise
 */
export function isInteger(s: string): boolean {
    for (const ch of s) {
        const ascii = ch.charCodeAt(0);

        // 48 is the ASCII value of 0 and 57 is the ASCII value of 9
        if (ascii < 48 || ascii > 57) {
            return false;
        }
    }

    return true;
}