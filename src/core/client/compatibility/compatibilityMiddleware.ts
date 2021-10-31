import { AllRequestsOf } from '../../messaging/AllRequestsOf';
import { compatDecodeValue } from '../../messaging/compatibility/compatDecodeValue';
import { compatEncodeValue } from '../../messaging/compatibility/compatEncodeValue';
import { QueryRegistry } from '../../messaging/QueryRegistry';
import { ResponseOf } from '../../messaging/ResponseOf';
import { ClientWorkerMessageMiddleware } from '../ClientWorkerMessageMiddleware';
import { WorkerClient } from '../WorkerClient';

export const compatibilityMiddleware: ClientWorkerMessageMiddleware = <
    TQueryRegistry extends QueryRegistry<{}>,
    TRequest extends AllRequestsOf<TQueryRegistry>
>(
    originalRequest: TRequest,
    worker: WorkerClient,
    next: (req: TRequest) => Promise<ResponseOf<TQueryRegistry, TRequest['type']>>
): Promise<ResponseOf<TQueryRegistry, TRequest['type']>> => {
    const request =
        worker.compatibility != null && worker.compatibility.map === false
            ? compatEncodeValue(originalRequest, new WeakMap())
            : originalRequest;

    return next(request).then((response) => {
        if (worker.compatibility?.map === false) {
            return {
                ...response,
                payload: compatDecodeValue(response.payload, new WeakMap()),
            };
        }
        return response;
    });
};
