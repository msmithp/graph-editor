/**
 * Maps a tuple of type [K, K] to values of type V.
 * 
 * Converts tuples to strings as a workaround to JavaScript's inability to
 * handle object keys in maps.
 */
export default class TupleMap<K, V> {
    // Store contents internally with strings as keys
    private map: Map<string, V>;

    // Assuming keys have a toString method, a separate custom method is needed
    // to convert from a string back into the original data type
    private fromString: (s: string) => K;

    constructor(fromString: (s: string) => K) {
        this.map = new Map();
        this.fromString = fromString;
    }

    get(key: [K, K]): V | undefined {
        return this.map.get(key.join(","));
    }

    set(key: [K, K], val: V) {
        return this.map.set(key.join(","), val);
    }

    has(key: [K, K]): boolean {
        return this.map.has(key.join(","));
    }

    forEach(callbackfn: (key: [K, K], value: V, map: Map<string, V>) => void) {
        for (const [key, val] of this.map) {
            const split = key.split(",");
            const fst = this.fromString(split[0]);
            const snd = this.fromString(split[1]);

            callbackfn([fst, snd], val, this.map);
        }
    }

    /**
     * Iterate through each `[key, value]` pair of the map and apply a function
     * to `key` and `value` returning a value of type `T`, and return a new
     * array of type `T[]`
     * @param callback Function applied to each `[key, value]` pair
     * @returns Array of results of applying `callback` to each `[key, value]`
     *          pair
     */
    arrayMap<T>(callback: (key: [K, K], value: V) => T): T[] {
        const results: T[] = [];

        for (const [key, val] of this.map.entries()) {
            const split = key.split(",");
            const fst = this.fromString(split[0]);
            const snd = this.fromString(split[1]);

            results.push(callback([fst, snd], val));
        }

        return results;
    }

    toString(): string {
        return this.map.toString();
    }
}