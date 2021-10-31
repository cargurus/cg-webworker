import 'regenerator-runtime/runtime';
import { setupWorkerCallBroker, WebWorker, WorkerQuery, ServiceRegistry, BaseContext } from '../../../../../src/core';
import type {
    someServiceRequest,
    someServiceResponse,
    usesWindowServiceRequest,
    usesWindowServiceResponse,
} from '../messaging';

declare global {
    interface Window {
        urls: { [key: string]: string };
    }
}

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
            serviceRegistry: serviceRegistryThatUsesWindow as ServiceRegistry<
                SomeQueryRegistry,
                BaseContext<SomeQueryRegistry>
            >,
            onError: (ex: Error) => {
                // eslint-disable-next-line no-console
                console.error(ex);
            },
        };
    },
    (config: {}, onSuccess) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment,no-multi-assign
        // @ts-ignore
        window = self.window = global.window = {};

        window.urls = {
            'some.url': 'asdf.com',
        };
        onSuccess();
    }
);
