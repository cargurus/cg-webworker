import 'regenerator-runtime/runtime';
import { setupWorkerCallBroker, WebWorker, WorkerQuery } from '../../../../../src/core';
import { someServiceRequest, someServiceResponse } from '../messaging';

throw new Error('Explode');

type SomeQueryRegistry = {
    SomeService: WorkerQuery<typeof someServiceRequest, typeof someServiceResponse>;
};

// eslint-disable-next-line no-unreachable
setupWorkerCallBroker(
    self as unknown as WebWorker<SomeQueryRegistry>,
    (worker, state) => ({
        worker: worker,
        logToConsole: false,
        workerState: state,
    }),
    async () => {
        const { validServiceRegistry } = await import(
            /* webpackMode: "eager" */ '../mockWorkerSetup/validServiceRegistry'
        );
        return {
            serviceRegistry: validServiceRegistry,
            onError: (ex: Error) => {
                // eslint-disable-next-line no-console
                console.error(ex);
            },
        };
    },
    (config: {}, onSuccess) => {
        onSuccess();
    }
);
