import { workerProvider } from '../../../../../src/core';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ErrorDuringInitialQueueWorker from './errorDuringInitialQueue.worker'; // eslint-disable-line import/default

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import FailDuringDatastoreInitWorker from './fail_during_datastore_init.worker'; // eslint-disable-line import/default

export const ErrorDuringInitialQueueWorkerProvider = () => {
    return workerProvider(
        'fail_during_init',
        () => new ErrorDuringInitialQueueWorker(),
        () => ({})
    );
};

export const FailDuringDataStoreInitWorkerProvider = () => {
    return workerProvider(
        'fail_during_datastore_init',
        () => new FailDuringDatastoreInitWorker(),
        () => ({})
    );
};
