import type { WorkerQuery } from './WorkerQuery';
import type { QueryRegistry } from './QueryRegistry';

export type AllResponsesOf<TQueryRegistry extends QueryRegistry<{}>> =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TQueryRegistry[keyof TQueryRegistry] extends WorkerQuery<any, infer X> ? ReturnType<X> : never;
