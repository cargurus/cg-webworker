import { QueryRegistry, WorkerMessage } from '../messaging';
import { BaseContext } from './BaseContext';
import { Work } from './Work';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type WorkerMessageMiddleware<
    TQueryRegistry extends QueryRegistry<{}>,
    TContext extends BaseContext<TQueryRegistry>
> = (
    req: Work<any>,
    context: TContext,
    next: (req: Work<any>, context: TContext) => Promise<WorkerMessage<any, any>>
) => Promise<WorkerMessage<any, any>>;
/* eslint-enable @typescript-eslint/no-explicit-any */
