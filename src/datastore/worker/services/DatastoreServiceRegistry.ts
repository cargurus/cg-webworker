import { DATASTORE_WORKERMESSAGE_KEYS } from '../../messaging/datastore.workerMessages';
import { doDataStoreQuery } from './doDataStoreQuery';
import { doSubscribeData, doSubscribeNotify } from './doSubscribe';
import { doUnsubscribeNotify, doUnsubscribeData } from './doUnsubscribe';

export const DatastoreServiceRegistry = {
    [DATASTORE_WORKERMESSAGE_KEYS.DATA_STORE_QUERY]: doDataStoreQuery,
    [DATASTORE_WORKERMESSAGE_KEYS.DATA_STORE_SUBSCRIBE]: doSubscribeData,
    [DATASTORE_WORKERMESSAGE_KEYS.DATA_STORE_UNSUBSCRIBE]: doUnsubscribeData,
    [DATASTORE_WORKERMESSAGE_KEYS.DATA_STORE_CHANGE_NOTIFY_SUBSCRIBE]: doSubscribeNotify,
    [DATASTORE_WORKERMESSAGE_KEYS.DATA_STORE_CHANGE_NOTIFY_UNSUBSCRIBE]: doUnsubscribeNotify,
} as const;
