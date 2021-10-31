import type { WorkerClient } from 'cg-webworker/core';
import type { DataStoreSubscriberActions } from '../messaging/datastore.subscriptionMessages';

export type ClientDatastoreSubscriberMiddleware = (
    responseMessage: DataStoreSubscriberActions,
    worker: WorkerClient,
    next: (responseMessage: DataStoreSubscriberActions) => void
) => void;
