import type { WorkerQuery } from './WorkerQuery';
import type { QueryRegistry } from './QueryRegistry';

export type ResponseOf<TQueryRegistry extends QueryRegistry<{}>, TType> = TType extends keyof TQueryRegistry
    ? TQueryRegistry[TType] extends WorkerQuery<any, infer X> // eslint-disable-line @typescript-eslint/no-explicit-any
        ? ReturnType<X>
        : never
    : never;
