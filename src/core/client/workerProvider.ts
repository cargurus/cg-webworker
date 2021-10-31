import { configWorkerAction, SendableObj } from '../messaging';
import { callBroker } from './CallBroker';
import { ClientWorkerMessageMiddleware } from './ClientWorkerMessageMiddleware';
import { compatibilityMiddleware } from './compatibility/compatibilityMiddleware';
import { fetchCompatInfo } from './compatibility/fetchCompatInfo';
import { WorkerClient } from './WorkerClient';

const activeWorkers: Map<string, Worker> = new Map<string, Worker>();

export const workerProvider = <T extends WorkerClient>(
    workerKey: string,
    workerFactory: () => T,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialization: () => Record<string, SendableObj<any>>,
    middleware: ClientWorkerMessageMiddleware[] | null = null
): T => {
    if (!activeWorkers.has(workerKey)) {
        const activeWorker = workerFactory();
        activeWorkers.set(workerKey, activeWorker);

        if (middleware) {
            activeWorker.middleware = middleware;

            if (process.env.LEGACY) {
                // Put the compatibility check pipeline as the last request processor/first response processor
                activeWorker.middleware = ([] as ClientWorkerMessageMiddleware[]).concat(
                    activeWorker.middleware || [],
                    [compatibilityMiddleware]
                );
            }
        }

        if (process.env.LEGACY) {
            fetchCompatInfo(activeWorker);
        }

        const initPayloadData = initialization();
        callBroker(activeWorker, configWorkerAction(window.location.origin, initPayloadData));

        return activeWorker;
    }
    return activeWorkers.get(workerKey) as T;
};
