import { workerProvider } from '../../../../../src/core';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import SuccessWorker from './success.worker'; // eslint-disable-line import/default

const exampleWorkerProvider = () => {
    return workerProvider(
        'success',
        () => new SuccessWorker(),
        () => ({})
    );
};
exampleWorkerProvider();
