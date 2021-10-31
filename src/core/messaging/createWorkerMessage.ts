// Declare typings to ensure all values passed to Structured Clone are compatible
/* eslint-disable @typescript-eslint/no-explicit-any */
type SendableTypes =
    | string
    | number
    | null
    | boolean
    | Date
    | undefined
    | RegExp
    | Blob
    | File
    | FileList
    | ArrayBuffer
    | ArrayBufferView
    | OffscreenCanvas
    | ImageBitmap
    | ImageData;
// eslint-disable-next-line @typescript-eslint/ban-types
type UnsendableTypes = Function | symbol | Error | Node | Event;

// TODO: This type checking is naive, need to check Map obj types
type SendableMap1<T> = T extends Map<infer U, infer Y> | ReadonlyMap<infer U, infer Y>
    ? U extends string | number | boolean | Date | null | RegExp
        ? Y extends UnsendableTypes
            ? never
            : T
        : never
    : never;
type SendableMap2<T> = T extends Map<infer U, infer Y> | ReadonlyMap<infer U, infer Y>
    ? U extends string | number | boolean | Date | null | RegExp
        ? Y extends UnsendableTypes
            ? never
            : T
        : never
    : never;
type SendableMap3<T> = T extends Map<infer U, infer Y> | ReadonlyMap<infer U, infer Y>
    ? U extends string | number | boolean | Date | null | RegExp
        ? Y extends UnsendableTypes
            ? never
            : T
        : never
    : never;
type SendableMap4<T> = T extends Map<infer U, infer Y> | ReadonlyMap<infer U, infer Y>
    ? U extends string | number | boolean | Date | null | RegExp
        ? Y extends UnsendableTypes
            ? never
            : T
        : never
    : never;
type SendableMap5<T> = T extends Map<infer U, infer Y> | ReadonlyMap<infer U, infer Y>
    ? U extends string | number | boolean | Date | null | RegExp
        ? Y extends UnsendableTypes
            ? never
            : T
        : never
    : never;

export type SendableValue<T> = T extends UnsendableTypes
    ? never
    : T extends SendableTypes
    ? T
    : NonNullable<T> extends Map<any, any> | ReadonlyMap<any, any>
    ? SendableMap1<NonNullable<T>> extends never
        ? never
        : T
    : NonNullable<T> extends (infer U)[]
    ? U extends SendableTypes
        ? T
        : SendableValue1<U> extends never
        ? never
        : T
    : NonNullable<T> extends object // eslint-disable-line @typescript-eslint/ban-types
    ? SendableObj1<T>
    : never;
type SendableValue1<T> = T extends UnsendableTypes
    ? never
    : T extends SendableTypes
    ? T
    : NonNullable<T> extends Map<any, any> | ReadonlyMap<any, any>
    ? SendableMap2<NonNullable<T>> extends never
        ? never
        : T
    : NonNullable<T> extends (infer U)[]
    ? U extends SendableTypes
        ? T
        : SendableValue2<U> extends never
        ? never
        : T
    : NonNullable<T> extends object // eslint-disable-line @typescript-eslint/ban-types
    ? SendableObj2<T>
    : never;
type SendableValue2<T> = T extends UnsendableTypes
    ? never
    : T extends SendableTypes
    ? T
    : NonNullable<T> extends Map<any, any> | ReadonlyMap<any, any>
    ? SendableMap3<NonNullable<T>> extends never
        ? never
        : T
    : NonNullable<T> extends (infer U)[]
    ? U extends SendableTypes
        ? T
        : SendableValue3<U> extends never
        ? never
        : T
    : NonNullable<T> extends object // eslint-disable-line @typescript-eslint/ban-types
    ? SendableObj3<T>
    : never;
type SendableValue3<T> = T extends UnsendableTypes
    ? never
    : T extends SendableTypes
    ? T
    : NonNullable<T> extends Map<any, any> | ReadonlyMap<any, any>
    ? SendableMap4<NonNullable<T>> extends never
        ? never
        : T
    : NonNullable<T> extends (infer U)[]
    ? U extends SendableTypes
        ? T
        : SendableValue4<U> extends never
        ? never
        : T
    : NonNullable<T> extends object // eslint-disable-line @typescript-eslint/ban-types
    ? SendableObj4<T>
    : never;
type SendableValue4<T> = T extends UnsendableTypes
    ? never
    : T extends SendableTypes
    ? T
    : NonNullable<T> extends Map<any, any> | ReadonlyMap<any, any>
    ? SendableMap5<NonNullable<T>> extends never
        ? never
        : T
    : NonNullable<T> extends (infer U)[]
    ? U extends SendableTypes
        ? T
        : SendableValue5<U> extends never
        ? never
        : T
    : NonNullable<T> extends object // eslint-disable-line @typescript-eslint/ban-types
    ? SendableObj5<T>
    : never;
type SendableValue5<T> = T extends UnsendableTypes ? never : T extends SendableTypes ? T : never;

export type SendableObj<T> = { [K in keyof T]: SendableValue<T[K]> };
type SendableObj1<T> = { [K in keyof T]: SendableValue1<T[K]> };
type SendableObj2<T> = { [K in keyof T]: SendableValue2<T[K]> };
type SendableObj3<T> = { [K in keyof T]: SendableValue3<T[K]> };
type SendableObj4<T> = { [K in keyof T]: SendableValue4<T[K]> };
type SendableObj5<T> = { [K in keyof T]: SendableValue5<T[K]> };
/* eslint-enable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface WorkerMessage<T extends string, P extends SendableObj<P>> {
    readonly type: T;
    readonly payload: P;
    readonly transferrables?: (ArrayBuffer | ImageBitmap | OffscreenCanvas | MessagePort)[];
}

export function createWorkerMessage<T extends string, P extends SendableObj<P>>({
    type,
    payload,
    transferrables,
}: {
    type: T;
    payload: P;
    transferrables?: (ArrayBuffer | ImageBitmap | OffscreenCanvas | MessagePort)[] | undefined;
}): WorkerMessage<T, P>;
export function createWorkerMessage<T extends string, P extends SendableObj<P>>({
    type,
    payload,
    transferrables,
}: {
    type: T;
    payload: P;
    transferrables?: (ArrayBuffer | ImageBitmap | OffscreenCanvas | MessagePort)[] | undefined;
}): WorkerMessage<T, P> {
    return { type, payload, transferrables };
}
