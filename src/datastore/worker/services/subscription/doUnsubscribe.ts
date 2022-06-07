import { BaseContext } from 'cg-webworker/core';
import {
    dataStoreChangeNotifyUnsubscribeRequest,
    dataStoreChangeNotifyUnsubscribeResponse,
    dataStoreUnsubscribeRequest,
    dataStoreUnsubscribeResponse,
} from '../../../messaging/datastore.workerMessages';
import { DatastoreContext } from '../../DatastoreContext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const doUnsubscribeData = <TContext extends BaseContext<any> & DatastoreContext<any>>(
    request: ReturnType<typeof dataStoreUnsubscribeRequest>['payload'],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ctx: TContext
): Promise<ReturnType<typeof dataStoreUnsubscribeResponse>> => {
    return new Promise((resolve, reject) => {
        if (!ctx.datastore) {
            reject(new Error('DataStore not initialized.'));
            return;
        }

        ctx.datastore.unsubscribeData(request.subscriberId);
        resolve(dataStoreUnsubscribeResponse());
    });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const doUnsubscribeNotify = <TContext extends BaseContext<any> & DatastoreContext<any>>(
    request: ReturnType<typeof dataStoreChangeNotifyUnsubscribeRequest>['payload'],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ctx: TContext
): Promise<ReturnType<typeof dataStoreChangeNotifyUnsubscribeResponse>> => {
    return new Promise((resolve, reject) => {
        if (!ctx.datastore) {
            reject(new Error('DataStore not initialized.'));
            return;
        }

        ctx.datastore.unsubscribeChanges(request.subscriberId);
        resolve(dataStoreChangeNotifyUnsubscribeResponse());
    });
};
