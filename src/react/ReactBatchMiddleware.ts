import { unstable_batchedUpdates } from 'react-dom';
import type { ClientDatastoreSubscriberMiddleware } from 'cg-webworker/datastore';

export const ReactBatchMiddleware: ClientDatastoreSubscriberMiddleware = (message, worker, next) => {
    unstable_batchedUpdates(() => {
        next(message);
    });
};
