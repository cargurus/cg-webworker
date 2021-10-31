import 'regenerator-runtime/runtime';
import { setupWorkerCallBroker, WebWorker, WorkerQuery } from '../../../../../src/core';
import { someServiceRequest, someServiceResponse } from '../messaging';

type SomeQueryRegistry = {
    SomeService: WorkerQuery<typeof someServiceRequest, typeof someServiceResponse>;
};

const ctx = setupWorkerCallBroker(
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

ctx.workerState.queue.push({
    requestId: '1234',
    message: {
        // Disabling Typings because we're breaking them on purpose to test
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        type: 'SOME_UNKNOWN_ACTION_TYPE',
        payload: {
            fail: true,
        },
    },
});
