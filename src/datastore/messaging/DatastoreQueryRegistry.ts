import type { QueryRegistry, WorkerQuery } from 'cg-webworker/core';
import type {
    DATASTORE_WORKERMESSAGE_KEYS,
    dataStoreQueryRequest,
    dataStoreQueryResponse,
    dataStoreFilterRequest,
    dataStoreFilterResponse,
    dataStoreSubscribeRequest,
    dataStoreSubscribeResponse,
    dataStoreUnsubscribeRequest,
    dataStoreUnsubscribeResponse,
    dataStoreChangeNotifySubscribeRequest,
    dataStoreChangeNotifySubscribeResponse,
    dataStoreChangeNotifyUnsubscribeRequest,
    dataStoreChangeNotifyUnsubscribeResponse,
} from './datastore.workerMessages';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DatastoreQueryRegistry extends QueryRegistry<any> {
    [DATASTORE_WORKERMESSAGE_KEYS.DATA_STORE_QUERY]: WorkerQuery<
        typeof dataStoreQueryRequest,
        typeof dataStoreQueryResponse
    >;
    [DATASTORE_WORKERMESSAGE_KEYS.DATA_STORE_FILTER]: WorkerQuery<
        typeof dataStoreFilterRequest,
        typeof dataStoreFilterResponse
    >;
    [DATASTORE_WORKERMESSAGE_KEYS.DATA_STORE_SUBSCRIBE]: WorkerQuery<
        typeof dataStoreSubscribeRequest,
        typeof dataStoreSubscribeResponse
    >;
    [DATASTORE_WORKERMESSAGE_KEYS.DATA_STORE_UNSUBSCRIBE]: WorkerQuery<
        typeof dataStoreUnsubscribeRequest,
        typeof dataStoreUnsubscribeResponse
    >;
    [DATASTORE_WORKERMESSAGE_KEYS.DATA_STORE_CHANGE_NOTIFY_SUBSCRIBE]: WorkerQuery<
        typeof dataStoreChangeNotifySubscribeRequest,
        typeof dataStoreChangeNotifySubscribeResponse
    >;
    [DATASTORE_WORKERMESSAGE_KEYS.DATA_STORE_CHANGE_NOTIFY_UNSUBSCRIBE]: WorkerQuery<
        typeof dataStoreChangeNotifyUnsubscribeRequest,
        typeof dataStoreChangeNotifyUnsubscribeResponse
    >;
}
