import type { WorkerMessage } from './createWorkerMessage';

export type WorkerQuery<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TT extends (...args: any[]) => WorkerMessage<any, any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TY extends (...args: any[]) => WorkerMessage<any, any>
> = {
    request: ReturnType<TT>;
    response: ReturnType<TY>;
};
