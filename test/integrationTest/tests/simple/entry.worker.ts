import { setupWorkerCallBroker } from '../../../../src/core/worker';
import { WebWorker } from '../../../../src/core/worker/WebWorker';
import { simpleConfigAction } from './messages';
import { SimpleQueryRegistry } from './queryRegistry';

setupWorkerCallBroker(
    self as unknown as WebWorker<SimpleQueryRegistry>,
    (worker, state) => ({
        worker: worker,
        logToConsole: true,
        workerState: state,
    }),
    async () => {
        const { SimpleServiceRegistry } = await import(/* webpackMode: "eager" */ './services');
        return {
            serviceRegistry: SimpleServiceRegistry,
            onError: (ex: Error) => {
                // eslint-disable-next-line no-console
                console.error(ex);
            },
        };
    },
    (dependencyPayload: ReturnType<typeof simpleConfigAction>['payload'], onSuccess) => {
        global.window = self;
        Object.entries(dependencyPayload.data).forEach(([key, val]) => {
            // Disabling typings, as we're just testing putting things on the window
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            global.window[key] = val;
        });
        onSuccess();
    }
);
