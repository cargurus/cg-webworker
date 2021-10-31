import { createWorkerMessage } from './createWorkerMessage';
import { WorkerErrorResponseAction } from './WorkerErrorResponseAction';

export function errorAction(ex: Error) {
    return createWorkerMessage({
        type: WorkerErrorResponseAction.ERROR,
        payload: {
            error: {
                errorName: ex.name,
                errorMessage: ex.message,
                errorStack: ex.stack,
            },
        },
    });
}

export const errorDuringWorkerInitResponse = (ex: Error) =>
    createWorkerMessage({
        type: WorkerErrorResponseAction.ERROR_DURING_INIT,
        payload: {
            error: {
                errorName: ex.name,
                errorMessage: ex.message,
                errorStack: ex.stack,
            },
        },
    });
