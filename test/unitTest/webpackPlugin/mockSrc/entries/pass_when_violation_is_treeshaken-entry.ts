import { workerProvider } from '../../../../../src/core';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import PassWhenTreeshakenWorker from './pass_when_violation_is_treeshaken.worker'; // eslint-disable-line import/default

export const PassWhenTreeshakenWorkerProvider = () => {
    return workerProvider(
        'PassWhenTreeshakenWorker',
        () => new PassWhenTreeshakenWorker(),
        () => ({})
    );
};
