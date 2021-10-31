import { WorkerClient, clientCallBroker, generateRequestId } from 'cg-webworker/core';
import {
    dataStoreChangeNotifySubscribeRequest,
    dataStoreSubscribeRequest,
    dataStoreSubscribeResponse,
    dataStoreUnsubscribeRequest,
} from '../messaging/datastore.workerMessages';
import { QueryKey } from '../messaging/makeQuery';
import { setupNotifySubscriberListener } from './setupNotifySubscriberListener';
import { ClientDatastoreSubscriberMiddleware } from './ClientDatastoreSubscriberMiddleware';
import { compatibilitySubscriberMiddleware } from './compatibility/compatibilitySubscriberMiddleware';
import { DatastoreQueryRegistry } from '../messaging';
import { Unsubscribe } from './Unsubscribe';

export type SubscribeCallBroker = {
    readonly onData: <TData>(
        query: QueryKey[],
        callback: (data: TData) => void,
        onError?: (ex: Error) => void
    ) => Unsubscribe;
    readonly onChange: (query: QueryKey[], callback: () => void, onError?: (ex: Error) => void) => Unsubscribe;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createSubscribeCallBroker = <TQueryRegistry extends DatastoreQueryRegistry>(
    worker: WorkerClient,
    middleware: ClientDatastoreSubscriberMiddleware[] | null = null
): SubscribeCallBroker => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataSubscribers = new Map<string, { onData: (data: any) => void; onError?: (ex: Error) => void }>();
    const changeSubscribers = new Map<string, { onChange: () => void; onError?: (ex: Error) => void }>();

    if (process.env.LEGACY) {
        middleware = [compatibilitySubscriberMiddleware].concat(middleware || []);
    }
    setupNotifySubscriberListener(worker, dataSubscribers, changeSubscribers, middleware);

    return {
        onData: <TData>(
            query: QueryKey[],
            callback: (data: TData) => void,
            onError?: (ex: Error) => void
        ): Unsubscribe => {
            const subscriberId = generateRequestId();
            dataSubscribers.set(subscriberId, { onData: callback, onError });

            clientCallBroker(worker, dataStoreSubscribeRequest(subscriberId, query)).then(
                (result: ReturnType<typeof dataStoreSubscribeResponse>['payload']) => {
                    callback(result.current);
                },
                (ex: Error) => {
                    if (onError) {
                        onError(ex);
                    }
                }
            );

            return () => {
                dataSubscribers.delete(subscriberId);
                clientCallBroker(worker, dataStoreUnsubscribeRequest(subscriberId)).catch((ex: Error) => {
                    if (onError) {
                        onError(ex);
                    }
                });
            };
        },
        onChange: (query: QueryKey[], callback: () => void, onError?: (ex: Error) => void): Unsubscribe => {
            const subscriberId = generateRequestId();
            changeSubscribers.set(subscriberId, { onChange: callback, onError });

            clientCallBroker(worker, dataStoreChangeNotifySubscribeRequest(subscriberId, query)).catch((ex: Error) => {
                if (onError) {
                    onError(ex);
                }
            });

            return () => {
                dataSubscribers.delete(subscriberId);
                clientCallBroker(worker, dataStoreUnsubscribeRequest(subscriberId)).catch((ex: Error) => {
                    if (onError) {
                        onError(ex);
                    }
                });
            };
        },
    };
};
