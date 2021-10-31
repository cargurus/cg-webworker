import { ClientWorkerMessageMiddleware } from './ClientWorkerMessageMiddleware';

export interface WorkerClient extends Worker {
    middleware?: ClientWorkerMessageMiddleware[];
    compatibility?: {
        map: boolean;
        referer: boolean;
    };
}
