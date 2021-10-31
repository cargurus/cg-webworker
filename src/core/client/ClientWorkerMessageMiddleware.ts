import { WorkerClient } from './WorkerClient';
import { QueryRegistry } from '../messaging/QueryRegistry';
import { AllRequestsOf } from '../messaging/AllRequestsOf';
import { ResponseOf } from '../messaging/ResponseOf';

export type ClientWorkerMessageMiddleware = <
    TQueryRegistry extends QueryRegistry<{}>,
    TRequest extends AllRequestsOf<TQueryRegistry>
>(
    req: TRequest,
    worker: WorkerClient,
    next: (req: TRequest) => Promise<ResponseOf<TQueryRegistry, TRequest['type']>>
) => Promise<ResponseOf<TQueryRegistry, TRequest['type']>>;
