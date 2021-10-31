import { workerProvider } from '../../../../../src/core';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import WorkerToRun from './fail_during_setup_dependencies.worker'; // eslint-disable-line import/default

const exampleWorkerProvider = () => {
    return workerProvider(
        'fail_during_setup_dependencies',
        () => new WorkerToRun(),
        () => ({})
    );
};
exampleWorkerProvider();
