import { compatDecodeValue } from '../../messaging/compatibility/compatDecodeValue';
import { compatEncodeValue } from '../../messaging/compatibility/compatEncodeValue';
import { WorkerMessage } from '../../messaging/createWorkerMessage';
import { BaseContext } from '../BaseContext';
import { Work } from '../Work';
import { WorkerMessageMiddleware } from '../WorkerMessageMiddleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const compatibilityMiddleware: WorkerMessageMiddleware<any, any> = <TContext extends BaseContext<any>>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    work: Work<any>,
    context: TContext,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    next: (req: Work<any>, context: TContext) => Promise<WorkerMessage<any, any>>
) => {
    let messagePayload = work.message.payload;
    if (!context.workerState.mapCompatibility) {
        messagePayload = compatDecodeValue({ ...messagePayload }, new WeakMap());
        work = {
            ...work,
            message: {
                ...work.message,
                payload: messagePayload,
            },
        };
    }

    return next(work, context).then((responseMessage) => {
        if (!context.workerState.mapCompatibility) {
            if (typeof responseMessage.payload === 'object') {
                return {
                    ...responseMessage,
                    payload: compatEncodeValue(responseMessage.payload, new WeakMap()),
                };
            }
        }

        return responseMessage;
    });
};
