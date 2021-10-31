import type { QueryRegistry } from '../messaging/QueryRegistry';
import type { WebWorker } from './WebWorker';
import type { Work } from './Work';

export interface BaseContext<TQueryRegistry extends QueryRegistry<{}>> {
    readonly worker: WebWorker<TQueryRegistry>;
    readonly workerState: {
        ready: boolean;
        queue: Work<TQueryRegistry>[];
        mapCompatibility: boolean | null;
        refererCompatibility: boolean;
    };
    logToConsole: boolean;
}
