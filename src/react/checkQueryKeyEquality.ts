// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function checkQueryKeyEquality(a: any, b: any): boolean {
    if (typeof a !== typeof b) {
        return false;
    }
    if (a == null || b == null) {
        if (a === null && b === null) {
            return true;
        }
        if (a === undefined && b === undefined) {
            return true;
        }
        return false;
    }

    if (typeof a === 'object') {
        if (a.constructor.name !== b.constructor.name) {
            // TODO: Dubious effort here
            return false;
        }

        /*
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
         */
        // Check immutable types
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
            return a === b;
        }

        if (a instanceof Date) {
            return a.getTime() === b.getTime();
        }

        if (Array.isArray(a)) {
            // Check diff length
            if (a.length !== b.length) {
                return false;
            }
            // Deep equal vals
            for (let i = 0; i < a.length; i++) {
                if (!checkQueryKeyEquality(a[i], b[i])) {
                    return false;
                }
            }
            return true;
        }
        if (a instanceof Map) {
            // Check diff length
            if (a.size !== b.size) {
                return false;
            }
            // DataStore keys are value types, not obj types, and order doesn't matter
            const aKeys = Array.from(a.keys());
            const bKeys = Array.from(b.keys());
            if (aKeys.some((aKey) => !bKeys.includes(aKey)) || bKeys.some((bKey) => !aKeys.includes(bKey))) {
                return false;
            }
            // Check map values after, as it'll generally by slower
            return aKeys.every((aKey) => checkQueryKeyEquality(a.get(aKey), b.get(aKey)));
        }

        if (a instanceof Set) {
            // Check diff length
            if (a.size !== b.size) {
                return false;
            }
            // DataStore keys are value types, not obj types, and order doesn't matter
            const aVals = Array.from(a.values());
            const bVals = Array.from(b.values());
            if (aVals.some((aVal) => !bVals.includes(aVal)) || bVals.some((bVal) => !aVals.includes(bVal))) {
                return false;
            }
            return true;
        }

        // obj check
        // DataStore keys are value types, not obj types, and order doesn't matter
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        // Check diff length
        if (a.size !== b.size) {
            return false;
        }
        if (aKeys.some((aKey) => !bKeys.includes(aKey)) || bKeys.some((bKey) => !aKeys.includes(bKey))) {
            return false;
        }
        // Check map values after, as it'll generally by slower
        return aKeys.every((aKey) => checkQueryKeyEquality(a[aKey], b[aKey]));
    }

    // Value type check
    return a === b;
}
