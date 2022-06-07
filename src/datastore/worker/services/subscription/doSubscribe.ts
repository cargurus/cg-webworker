import { BaseContext } from 'cg-webworker/core';
import {
    dataStoreChangeNotifySubscribeRequest,
    dataStoreChangeNotifySubscribeResponse,
    dataStoreSubscribeRequest,
    dataStoreSubscribeResponse,
} from '../../../messaging/datastore.workerMessages';
import { executeDataStoreQuery } from '../querying/executeDataStoreQuery';
import { DatastoreContext } from '../../DatastoreContext';
import { BaseRootState } from '../../../messaging/BaseRootState';

export const doSubscribeData = <
    TRootState extends BaseRootState,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TContext extends BaseContext<any> & DatastoreContext<TRootState>
>(
    request: ReturnType<typeof dataStoreSubscribeRequest>['payload'],
    ctx: TContext
): Promise<ReturnType<typeof dataStoreSubscribeResponse>> => {
    return new Promise((resolve, reject) => {
        if (!ctx.datastore) {
            reject(new Error('DataStore not initialized.'));
            return;
        }

        const result = executeDataStoreQuery(ctx.datastore.getRootState, request.query);

        ctx.datastore.subscribeData(request.subscriberId, request.query, result);

        resolve(dataStoreSubscribeResponse(request.subscriberId, result));
    });
};

export const doSubscribeNotify = <
    TRootState extends BaseRootState,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TContext extends BaseContext<any> & DatastoreContext<TRootState>
>(
    request: ReturnType<typeof dataStoreChangeNotifySubscribeRequest>['payload'],
    ctx: TContext
): Promise<ReturnType<typeof dataStoreChangeNotifySubscribeResponse>> => {
    return new Promise((resolve, reject) => {
        if (!ctx.datastore) {
            reject(new Error('DataStore not initialized.'));
            return;
        }

        const result = executeDataStoreQuery(ctx.datastore.getRootState, request.query);

        ctx.datastore.subscribeChanges(request.subscriberId, request.query, result);

        resolve(dataStoreChangeNotifySubscribeResponse());
    });
};
