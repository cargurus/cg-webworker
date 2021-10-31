import { workerProvider } from '../../../../../src/core';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import FailBeforeSetupWorker from './fail_before_setup.worker'; // eslint-disable-line import/default

export const exampleWorkerProvider = () => {
    return workerProvider(
        'fail_before_setup',
        () => new FailBeforeSetupWorker(),
        () => ({})
    );
};
