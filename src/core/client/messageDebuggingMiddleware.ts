import type { AllRequestsOf } from '../messaging/AllRequestsOf';
import type { WorkerMessage } from '../messaging/createWorkerMessage';
import type { QueryRegistry } from '../messaging/QueryRegistry';
import type { ResponseOf } from '../messaging/ResponseOf';
import type { ClientWorkerMessageMiddleware } from './ClientWorkerMessageMiddleware';
import type { WorkerClient } from './WorkerClient';

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        WorkerRequests?: WorkerMessage<any, any>[];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        WorkerResponses?: WorkerMessage<any, any>[];
    }
}

export const messageDebuggingMiddleware: ClientWorkerMessageMiddleware = <
    TQueryRegistry extends QueryRegistry<{}>,
    TRequest extends AllRequestsOf<TQueryRegistry>
>(
    request: TRequest,
    worker: WorkerClient,
    next: (req: TRequest) => Promise<ResponseOf<TQueryRegistry, TRequest['type']>>
): Promise<ResponseOf<TQueryRegistry, TRequest['type']>> => {
    if (!window.WorkerRequests) window.WorkerRequests = [];
    if (!window.WorkerResponses) window.WorkerResponses = [];

    window.WorkerRequests.push(request);

    return next(request).then((response) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        window.WorkerResponses!.push(response);
        return response;
    });
};
