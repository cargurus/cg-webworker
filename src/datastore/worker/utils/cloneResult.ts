export function cloneResult<T>(a: T): T {
    if (a == null) {
        return a;
    }

    if (typeof a === 'object') {
        // Return immutable types
        if (
            a instanceof RegExp ||
            a instanceof Blob ||
            a instanceof File ||
            ('FileList' in global && a instanceof FileList) ||
            ('ArrayBuffer' in global && a instanceof ArrayBuffer) ||
            ('Int8Array' in global && a instanceof Int8Array) ||
            ('Uint8Array' in global && a instanceof Uint8Array) ||
            ('Uint8ClampedArray' in global && a instanceof Uint8ClampedArray) ||
            ('Int16Array' in global && a instanceof Int16Array) ||
            ('Uint16Array' in global && a instanceof Uint16Array) ||
            ('Int32Array' in global && a instanceof Int32Array) ||
            ('Uint32Array' in global && a instanceof Uint32Array) ||
            ('Float32Array' in global && a instanceof Float32Array) ||
            ('Float64Array' in global && a instanceof Float64Array) ||
            ('DataView' in global && a instanceof DataView) ||
            ('ImageBitmap' in global && a instanceof ImageBitmap) ||
            ('ImageData' in global && a instanceof ImageData) ||
            ('OffscreenCanvas' in global && a instanceof OffscreenCanvas) ||
            a instanceof Boolean ||
            a instanceof String
        ) {
            return a;
        }

        if (a instanceof Date) {
            return new Date(a.getTime()) as unknown as T;
        }

        if (Array.isArray(a)) {
            return a.map(cloneResult) as unknown as T;
        }

        if (a instanceof Map) {
            return new Map(Array.from(a.entries()).map(([k, v]) => [cloneResult(k), cloneResult(v)])) as unknown as T;
        }

        if (a instanceof Set) {
            return new Set(Array.from(a.values()).map((v) => cloneResult(v))) as unknown as T;
        }

        return Object.keys(a).reduce((accum, key: string) => {
            // eslint-disable-next-line no-param-reassign,@typescript-eslint/no-explicit-any
            accum[key] = cloneResult((a as Record<string, any>)[key]);
            return accum;
        }, {} as Record<string, any>) as T; // eslint-disable-line @typescript-eslint/no-explicit-any
    }

    if (typeof a === 'function') {
        throw new Error(`Can't clone functions.`);
    } else if (typeof a === 'symbol') {
        throw new Error(`Can't clone symbols.`);
    }

    // Value type
    return a;
}
