import { workerProvider } from '../../../../../src/core';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import FailDuringServiceRegistryWorker from './fail_during_service_registry_import.worker'; // eslint-disable-line import/default

export const exampleWorkerProvider = () => {
    return workerProvider(
        '',
        () => new FailDuringServiceRegistryWorker(),
        () => ({})
    );
};
