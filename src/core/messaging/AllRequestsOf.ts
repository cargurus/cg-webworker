import type { WorkerQuery } from './WorkerQuery';
import type { QueryRegistry } from './QueryRegistry';

export type AllRequestsOf<TQueryRegistry extends QueryRegistry<{}>> =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TQueryRegistry[keyof TQueryRegistry] extends WorkerQuery<infer X, any> ? ReturnType<X> : never;
