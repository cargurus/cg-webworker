import 'regenerator-runtime/runtime';
import { setupWorkerCallBroker, WebWorker, WorkerQuery } from '../../../../../src/core';
import {
    someServiceRequest,
    someServiceResponse,
    usesWindowServiceRequest,
    usesWindowServiceResponse,
} from '../messaging';

type SomeQueryRegistry = {
    SomeService: WorkerQuery<typeof someServiceRequest, typeof someServiceResponse>;
    UsesWindowService: WorkerQuery<typeof usesWindowServiceRequest, typeof usesWindowServiceResponse>;
};

setupWorkerCallBroker(
    self as unknown as WebWorker<SomeQueryRegistry>,
    (worker, state) => ({
        worker: worker,
        logToConsole: false,
        workerState: state,
    }),
    async () => {
        const { serviceRegistryThatUsesWindow } = await import(
            /* webpackMode: "eager" */ '../mockWorkerSetup/serviceRegistryThatUsesWindow'
        );
        return {
            serviceRegistry: serviceRegistryThatUsesWindow,
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
