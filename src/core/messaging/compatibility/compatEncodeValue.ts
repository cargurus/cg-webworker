/* eslint-disable no-param-reassign,@typescript-eslint/no-explicit-any */

// eslint-disable-next-line @typescript-eslint/ban-types
export const compatEncodeValue = (objVal: any, checkObjects: WeakMap<object, object>): any => {
    if (!process.env.LEGACY) {
        return objVal;
    }
    if (checkObjects.has(objVal)) {
        return checkObjects.get(objVal);
    }

    if (
        objVal == null ||
        typeof objVal !== 'object' ||
        objVal instanceof Date ||
        objVal instanceof RegExp ||
        objVal instanceof Blob ||
        objVal instanceof File ||
        ('FileList' in global && objVal instanceof FileList) ||
        ('ArrayBuffer' in global && objVal instanceof ArrayBuffer) ||
        ('Int8Array' in global && objVal instanceof Int8Array) ||
        ('Uint8Array' in global && objVal instanceof Uint8Array) ||
        ('Uint8ClampedArray' in global && objVal instanceof Uint8ClampedArray) ||
        ('Int16Array' in global && objVal instanceof Int16Array) ||
        ('Uint16Array' in global && objVal instanceof Uint16Array) ||
        ('Int32Array' in global && objVal instanceof Int32Array) ||
        ('Uint32Array' in global && objVal instanceof Uint32Array) ||
        ('Float32Array' in global && objVal instanceof Float32Array) ||
        ('Float64Array' in global && objVal instanceof Float64Array) ||
        ('DataView' in global && objVal instanceof DataView) ||
        ('ImageBitmap' in global && objVal instanceof ImageBitmap) ||
        ('ImageData' in global && objVal instanceof ImageData) ||
        ('OffscreenCanvas' in global && objVal instanceof OffscreenCanvas) ||
        ('MessagePort' in global && objVal instanceof MessagePort)
    ) {
        return objVal;
    } else if (objVal instanceof Array || Array.isArray(objVal)) {
        const result = objVal.slice();
        checkObjects.set(objVal, result);
        for (let i = 0; i < result.length; i++) {
            result[i] = compatEncodeValue(result[i], checkObjects);
        }
        return result;
    } else if (objVal instanceof Set) {
        const result = { __magic: 'Set', value: Array.from(objVal) };
        checkObjects.set(objVal, result);
        result.value = result.value.map((v) => compatEncodeValue(v, checkObjects));
        return result;
    } else if (objVal instanceof Map) {
        const result = {
            __magic: 'Map',
            value: Array.from(objVal),
        };
        checkObjects.set(objVal, result);
        result.value = result.value.map(([k, v]) => [
            compatEncodeValue(k, checkObjects),
            compatEncodeValue(v, checkObjects),
        ]);
        return result;
    } else {
        const result = { ...objVal };
        checkObjects.set(objVal, result);
        Object.keys(result).forEach((k) => {
            if (typeof result === 'object') {
                const compatParsedValue = compatEncodeValue(result[k], checkObjects);
                result[k] = compatParsedValue;
            }
        });
        return result;
    }
};
