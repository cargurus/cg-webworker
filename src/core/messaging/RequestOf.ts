import type { WorkerQuery } from './WorkerQuery';
import type { QueryRegistry } from './QueryRegistry';

export type RequestOf<TQR extends QueryRegistry<{}>, TType> = TType extends keyof TQR
    ? TQR[TType] extends WorkerQuery<infer X, any> // eslint-disable-line @typescript-eslint/no-explicit-any
        ? ReturnType<X>
        : never
    : never;
