import './applyPolyfills';
import { createStore } from 'redux';
import { initializeDatastore } from 'cg-webworker/datastore';
import { setupWorkerCallBroker, WebWorker } from 'cg-webworker/core';
import { rootReducer } from './datastore/rootReducer';
import { ExampleQueryRegistry } from './ExampleQueryRegistry';
import { ExampleContext } from './ExampleContext';
import { ExampleServiceRegistry } from './services/ExampleServiceRegistry';
import { ConfigPayload } from './ConfigPayload';

setupWorkerCallBroker<ExampleQueryRegistry, ExampleContext, typeof ExampleServiceRegistry, ConfigPayload>(
    self as unknown as WebWorker<ExampleQueryRegistry>,
    (worker, workerState) => {
        const store = createStore(rootReducer);

        const ctx: ExampleContext = {
            worker,
            workerState,
            logToConsole: true,
            dispatch: store.dispatch,
            datastore: initializeDatastore(
                () => ctx,
                () => {
                    return store.getState();
                }
            ),
        };
        store.subscribe(() => {
            ctx.datastore.handleStoreChanges();
        });
        return ctx;
    },
    async () => {
        return {
            serviceRegistry: await import(/* webpackMode: "eager" */ './services/ExampleServiceRegistry').then(
                (mod) => mod.ExampleServiceRegistry
            ),
            // eslint-disable-next-line no-console
            onError: (ex: Error) => console.error(ex),
        };
    },
    (config, onSuccess: () => void) => {
        // eslint-disable-next-line no-console
        console.log('goodTimes?', config.data.environmentVariables.goodTimes);
        onSuccess();
    }
);
