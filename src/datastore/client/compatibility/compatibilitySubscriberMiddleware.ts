import { compatibility, WorkerClient } from 'cg-webworker/core';
import { DataStoreSubscriberActions } from '../../messaging/datastore.subscriptionMessages';
import { ClientDatastoreSubscriberMiddleware } from '../ClientDatastoreSubscriberMiddleware';

/**
 * If compatibility mode is needed, like for IE11, we want to decode the objects before passing them on to the next middleware.
 */
export const compatibilitySubscriberMiddleware: ClientDatastoreSubscriberMiddleware = (
    responseMessage: DataStoreSubscriberActions,
    worker: WorkerClient,
    next: (responseMessage: DataStoreSubscriberActions) => Promise<void> | void
) => {
    if (!process.env.LEGACY) {
        return next(responseMessage);
    }

    if (!worker.compatibility) {
        throw new Error('Compatibility information not received yet.');
    }
    let result: DataStoreSubscriberActions = responseMessage;
    if (!worker.compatibility.map) {
        if (typeof responseMessage.payload === 'object') {
            result = {
                ...responseMessage,
                payload: compatibility.compatDecodeValue(responseMessage.payload, new WeakMap()),
            };
        }
    }

    return next(result);
};
