import type { WorkerClient } from './WorkerClient';
import { errorAction } from '../messaging/errorAction';
import { unknownActionType } from '../messaging/unknownActionType';
import { WorkerErrorResponseAction } from '../messaging/WorkerErrorResponseAction';
import { waitForCompatibilityInfo } from './compatibility/fetchCompatInfo';

import type { IBrokeredRequest } from '../messaging/IBrokeredMessage';
import { generateRequestId } from '../messaging/generateRequestId';
import { QueryRegistry } from '../messaging/QueryRegistry';
import { AllRequestsOf } from '../messaging/AllRequestsOf';
import { ResponseOf } from '../messaging/ResponseOf';
import { source } from '../messaging/source';

interface CallBrokerResponse<TQueryRegistry extends QueryRegistry<{}>> extends MessageEvent {
    readonly data: IBrokeredRequest<TQueryRegistry>;
}

const mainMessageProcessor = <TQueryRegistry extends QueryRegistry<{}>, TRequest extends AllRequestsOf<TQueryRegistry>>(
    request: TRequest,
    worker: WorkerClient
): Promise<ResponseOf<TQueryRegistry, TRequest['type']>> => {
    const requestId = generateRequestId();

    return new Promise((resolve, reject) => {
        const listener = (
            ev: CallBrokerResponse<ResponseType | ReturnType<typeof errorAction> | ReturnType<typeof unknownActionType>>
        ) => {
            if (requestId !== ev.data.requestId) {
                return;
            }
            worker.removeEventListener('message', listener, false);

            const responseBody = ev.data.message as ResponseOf<TQueryRegistry, TRequest['type']>;

            switch (responseBody.type) {
                case WorkerErrorResponseAction.ERROR: {
                    const error = new Error(responseBody.payload.error.errorMessage);
                    error.name = responseBody.payload.error.errorName;
                    error.stack = responseBody.payload.error.errorStack;
                    reject(error);
                    break;
                }
                case WorkerErrorResponseAction.UNKNOWN_ACTION:
                    reject(new Error(`Unknown action: ${responseBody.payload.type}`));
                    break;
                default:
                    resolve(responseBody);
                    break;
            }
        };
        worker.addEventListener('message', listener, false);

        try {
            if (request.transferrables) {
                const realRequest = {
                    ...request,
                } as Omit<typeof request, 'transferrables'> & { transferrables: unknown };
                delete realRequest.transferrables;
                worker.postMessage(
                    {
                        requestId,
                        message: realRequest,
                        source: source,
                    },
                    request.transferrables
                );
            } else {
                worker.postMessage({
                    requestId,
                    message: request,
                    source: source,
                });
            }
        } catch (ex) {
            reject(ex);
        }
    });
};

export const callBroker = <TQueryRegistry extends QueryRegistry<{}>, TRequest extends AllRequestsOf<TQueryRegistry>>(
    worker: WorkerClient,
    request: TRequest
): Promise<ResponseOf<TQueryRegistry, TRequest['type']>['payload']> => {
    let waiting = Promise.resolve();
    if (process.env.LEGACY) {
        if (worker.compatibility == null) {
            waiting = waitForCompatibilityInfo(worker);
        }
    }

    return waiting
        .then((): Promise<ResponseOf<TQueryRegistry, TRequest['type']>> => {
            if (worker.middleware) {
                let i = 0;
                const nexter = (req: TRequest): Promise<ResponseOf<TQueryRegistry, TRequest['type']>> => {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    if (i + 1 > worker.middleware!.length) {
                        return mainMessageProcessor(req, worker);
                    }
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    return worker.middleware![i++](req, worker, nexter);
                };
                return nexter(request);
            } else {
                return mainMessageProcessor(request, worker);
            }
        })
        .then((response: ResponseOf<TQueryRegistry, TRequest['type']>) => response.payload);
};
