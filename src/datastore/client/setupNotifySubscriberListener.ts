import { WorkerClient } from 'cg-webworker/core';
import { DataStoreSubscriberActions, DATASTORE_SUBSCRIPTIONMESSAGE_KEYS } from '../messaging';
import { SubscriberResponseMessage } from '../messaging/SubscriberResponseMessage';
import { source } from '../messaging/source';
import { ClientDatastoreSubscriberMiddleware } from './ClientDatastoreSubscriberMiddleware';

export const setupNotifySubscriberListener = (
    worker: WorkerClient,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataSubscribers: ReadonlyMap<string, { onData: (data: any) => void; onError?: (ex: Error) => void }>,
    changeSubscribers: ReadonlyMap<string, { onChange: () => void; onError?: (ex: Error) => void }>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    middleware: ClientDatastoreSubscriberMiddleware[] | null = null
): void => {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const listener = (ev: MessageEvent<SubscriberResponseMessage | {}>) => {
        if (!('source' in ev.data) || ev.data.source !== source) {
            return;
        }
        if (ev.data.message.type !== DATASTORE_SUBSCRIPTIONMESSAGE_KEYS.DATASTORE_SUBSCRIBER_NOTIFY) {
            return;
        }

        const responseBody = ev.data.message;

        let i = 0;
        const nexter = (message: DataStoreSubscriberActions): void => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            if (i + 1 > middleware!.length) {
                return processChanges(dataSubscribers, changeSubscribers, message);
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return middleware![i++](message, worker, nexter);
        };
        return nexter(responseBody);
    };
    worker.addEventListener('message', listener, false);
};

function processChanges(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataSubscribers: ReadonlyMap<string, { onData: (data: any) => void; onError?: (ex: Error) => void }>,
    changeSubscribers: ReadonlyMap<string, { onChange: () => void; onError?: (ex: Error) => void }>,
    message: DataStoreSubscriberActions
) {
    const updatedDataBySubscriberId = message.payload.changes.data;
    for (const [subscriberId, data] of updatedDataBySubscriberId.entries()) {
        const sub = dataSubscribers.get(subscriberId);
        if (sub) {
            sub.onData(data);
        } else if ((process.env.NODE_ENV as string) === 'development') {
            // eslint-disable-next-line no-console
            console.warn(`DataSubscriber not found for subscriberId: ${subscriberId}`);
        }
    }

    const notificationsBySubscriberId = message.payload.changes.notify;
    notificationsBySubscriberId.forEach((subscriberId) => {
        const sub = changeSubscribers.get(subscriberId);
        if (sub) {
            sub.onChange();
        } else if ((process.env.NODE_ENV as string) === 'development') {
            // eslint-disable-next-line no-console
            console.warn(`ChangeSubscriber not found for subscriberId: ${subscriberId}`);
        }
    });
}
