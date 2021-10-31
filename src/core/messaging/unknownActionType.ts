import { createWorkerMessage, SendableObj } from './createWorkerMessage';
import { WorkerErrorResponseAction } from './WorkerErrorResponseAction';

export function unknownActionType(actionType: string) {
    return createWorkerMessage({ type: WorkerErrorResponseAction.UNKNOWN_ACTION, payload: { type: actionType } });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function unknownPacket(action: SendableObj<any>) {
    return createWorkerMessage({ type: WorkerErrorResponseAction.ERROR_UNKNOWN_PACKET, payload: action });
}
