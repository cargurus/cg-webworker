import { createWorkerMessage } from 'cg-webworker/core';
import { Changes } from './Changes';

export const DATASTORE_SUBSCRIPTIONMESSAGE_KEYS = {
    /**
     * Notify subscribers of new data and changed nodes
     */
    DATASTORE_SUBSCRIBER_NOTIFY: 'DATASTORE/SUBSCRIBER/NOTIFY',
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dataStoreSubscriberNotifyAction = (changes: Changes) =>
    createWorkerMessage({
        type: DATASTORE_SUBSCRIPTIONMESSAGE_KEYS.DATASTORE_SUBSCRIBER_NOTIFY,
        payload: {
            changes,
        },
    });

export type DataStoreSubscriberActions = ReturnType<typeof dataStoreSubscriberNotifyAction>;
