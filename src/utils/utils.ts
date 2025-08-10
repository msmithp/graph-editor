import type { Point2D } from "../types/Graphics";

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

/**
 * Force a value between `min` and `max`. That is,
 * * If `value` is lower than `min`, return `min`
 * * If `value` is greater than `max`, return `max`
 * * Otherwise, return `value`
 * 
 * @param value Value to be squeezed
 * @param min High end of range
 * @param max Low end of range
 * @returns Squeezed value
 */
export function squeeze(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

/**
 * Convert SVG coordinates to client coordinates
 * @param svg SVG element
 * @param x SVG x-coordinate
 * @param y SVG y-coordinate
 * @returns Client coordinates
 */
export function getSVGPoint(svg: SVGSVGElement, x: number,
    y: number): Point2D {
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

/**
 * If a string is longer than `n` characters, shorten it to be `n` characters
 * long with "..." appended
 * @param str String to be potentially truncated
 * @param n Maximum number of characters to be displayed before the ellipsis
 * @returns If `str` is longer than `n`, then a truncated version of `str` with
 *          an ellipsis (`...`) added. Otherwise, just `str`.
 */
export function truncate(str: string, n: number): string {
    return str.length > n ? `${str.substring(0, n)}...` : str;
}

/**
 * Return a list of array indices that iterate through an array starting from
 * the outermost indices and ending at the middle
 * @param length Length of array
 * @returns List of indices
 */
export function outsideInIndices(length: number): number[] {
    if (length <= 0) {
        return [];
    }

    const indices = new Array(length);
    const mid = Math.floor((length-1) / 2);

    for (let i = 0; i < length; i++) {
        // This is like a bijective mapping from the natural numbers (including
        // 0) to the integers, offset by `mid`
        const idx = i % 2 === 0 ? (
            mid - Math.floor(i/2) 
        ) : (
            mid + Math.floor((i+1) / 2)
        );

        // Enter indices into array backwards - to go from the middle outwards,
        // we could change the index to `i`
        indices[length-1-i] = idx;
    }

    return indices;
}

/**
 * Check if any values exist in `nums` within the range `low`-`high`, inclusive
 * 
 * @param nums List of numbers
 * @param low Low end of range
 * @param high High end of range
 * @returns `true` if `nums` contains any element between `low` and `high`,
 *          `false` otherwise
 */
export function binaryRangeSearch(nums: number[], low: number,
    high: number): boolean {
    // Binary search for number between low and high
    const idx = binarySearch(nums, (low + high) / 2, compareNumbers);

    if (idx >= 0) {
        // Positive index means the exact number between low and high is in the
        // list, which is obviously between low and high
        return true;
    }

    const wouldBeIdx = (idx + 1) * -1;
    
    if (wouldBeIdx === 0) {
        return nums[0] <= high;
    }

    if (nums[wouldBeIdx-1] >= low || nums[wouldBeIdx] <= high) {
        return true;
    }

    return false;
}

/**
 * Perform a binary search to find the index of an element in a sorted array.
 * Based on Alexander Ryzhov's answer: https://stackoverflow.com/a/29018745
 * 
 * @param nums Sorted array
 * @param key Element being searched for
 * @param compare Comparison function for elements of array
 * @returns If `key` is found, then the index of `key` is returned. Otherwise,
 *          for the index `i` at which `key` would have been, `-i - 1` will be
 *          returned.
 */
export function binarySearch<T>(arr: T[], key: T,
    compare: (a: T, b: T) => number): number {
    let lo = 0;
    let hi = arr.length - 1;

    while (lo <= hi) {
        let mid = Math.floor((lo + hi) / 2);
        let cmp = compare(key, arr[mid]);

        if (cmp > 0) {
            // Key is greater than element at mid
            lo = mid + 1;
        } else if (cmp < 0) {
            // Key is less than element at mid
            hi = mid - 1;
        } else {
            // Key found
            return mid;
        }
    }

    return -lo - 1;
}

/**
 * Compare two numbers
 * 
 * @param num1 First number
 * @param num2 Second number
 * @returns The difference between `num1` and `num2`. That is,
 *          * A positive number, if `num1 > num2`
 *          * A negative number, if `num1 < num2`
 *          * 0, if `num1 == num2`
 */
function compareNumbers(num1: number, num2: number): number {
    return num1 - num2;
}