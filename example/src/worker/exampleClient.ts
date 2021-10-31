import {
    workerProvider,
    clientCallBroker,
    AllRequestsOf,
    WorkerClient,
    messageDebuggingMiddleware,
} from 'cg-webworker/core';
import { createSubscribeCallBroker } from 'cg-webworker/datastore';
import { ReactBatchMiddleware } from 'cg-webworker/react';

import { ExampleQueryRegistry } from './ExampleQueryRegistry';
import { ConfigPayload } from './ConfigPayload';

// Ignored so we can let worker-loader do its thing
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ExampleWorkerReference from './example.worker_entry';

export const exampleWorkerProvider = () =>
    workerProvider(
        'ExampleWorker',
        () => new ExampleWorkerReference() as WorkerClient,
        () => ({ environmentVariables: { goodTimes: 'yes' } } as ConfigPayload['data']),
        [messageDebuggingMiddleware]
    );

export const exampleWorker = <TRequest extends AllRequestsOf<ExampleQueryRegistry>>(request: TRequest) =>
    clientCallBroker<ExampleQueryRegistry, TRequest>(exampleWorkerProvider(), request);
export const exampleDatastore = createSubscribeCallBroker<ExampleQueryRegistry>(exampleWorkerProvider(), [
    ReactBatchMiddleware,
]);
