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
type SendableMap<T> = T extends Map<infer U, infer Y> | ReadonlyMap<infer U, infer Y>
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
    ? SendableMap<NonNullable<T>> extends never
        ? never
        : T
    : NonNullable<T> extends (infer U)[]
    ? U extends SendableTypes
        ? T
        : SendableValue<U> extends never
        ? never
        : T
    : NonNullable<T> extends object // eslint-disable-line @typescript-eslint/ban-types
    ? SendableObj<T>
    : never;

export type SendableObj<T> = { [K in keyof T]: SendableValue<T[K]> };
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
