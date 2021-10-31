/* eslint-disable no-param-reassign,@typescript-eslint/no-explicit-any,@typescript-eslint/ban-types */
export const compatDecodeValue = (objVal: any, checkObjects: WeakMap<object, object>): any => {
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
            result[i] = compatDecodeValue(result[i], checkObjects);
        }
        return result;
    } else if ('__magic' in objVal) {
        switch (objVal.__magic) {
            case 'Set': {
                const result = new Set();
                checkObjects.set(objVal, result);
                objVal.value.forEach((v: any) => {
                    result.add(compatDecodeValue(v, checkObjects));
                });
                return result;
            }
            case 'Map': {
                const result = new Map();
                checkObjects.set(objVal, result);
                objVal.value.forEach(([k, v]: [any, any]) => {
                    result.set(compatDecodeValue(k, checkObjects), compatDecodeValue(v, checkObjects));
                });
                return result;
            }
            default: {
                throw new Error('Unrecognized __magic value for Map compatibility mode.');
            }
        }
    } else {
        const result = { ...objVal };
        checkObjects.set(objVal, result);
        Object.keys(result).forEach((k) => {
            const compatParsedValue = compatDecodeValue(result[k], checkObjects);
            result[k] = compatParsedValue;
        });
        return result;
    }
};
