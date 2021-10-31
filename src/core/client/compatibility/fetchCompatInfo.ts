import { WorkerClient } from '../WorkerClient';
import { ConfigWorkerActionKeys } from '../../messaging/configWorkerAction';
import { setupIncompatibleFetchReceiver } from './incompatibleFetchReceiver';
import {
    checkCompatibilityRequest,
    checkCompatibilityResponse,
} from '../../messaging/compatibility/checkCompatibilityMessages';
import { generateRequestId } from '../../messaging';
import { IBrokeredRequest } from '../../messaging/IBrokeredMessage';
import { source } from '../../messaging/source';

let compatInProgress: Promise<void> | null = null;
export const fetchCompatInfo = (worker: WorkerClient): Promise<void> => {
    compatInProgress = new Promise<void>((resolve) => {
        const requestId = generateRequestId();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const compatibilityListener = (ev: MessageEvent<IBrokeredRequest<any>>) => {
            if (typeof ev.data !== 'object') {
                return;
            }
            if (ev.data.source !== source) {
                return;
            }
            if (requestId !== ev.data.requestId) {
                return;
            }
            const { message } = ev.data;
            if (message.type === ConfigWorkerActionKeys.COMPATIBILITY) {
                ev.preventDefault();

                const messageData = message.payload as ReturnType<typeof checkCompatibilityResponse>['payload'];

                worker.compatibility = {
                    map: messageData.map,
                    referer: messageData.referer,
                };
                worker.removeEventListener('message', compatibilityListener, false);

                if (!worker.compatibility.referer) {
                    setupIncompatibleFetchReceiver(worker);
                }

                resolve();
            }
        };
        worker.addEventListener('message', compatibilityListener, false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const request: IBrokeredRequest<any> = {
            message: checkCompatibilityRequest(),
            requestId,
            source,
        };
        worker.postMessage(request);
    });
    return compatInProgress;
};
export const waitForCompatibilityInfo = (worker: WorkerClient): Promise<void> => {
    if (compatInProgress) {
        return compatInProgress;
    }
    return fetchCompatInfo(worker);
};
