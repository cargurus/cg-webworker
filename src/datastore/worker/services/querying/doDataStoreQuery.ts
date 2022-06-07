import { BaseContext } from 'cg-webworker/core';
import { BaseRootState } from '../../../messaging/BaseRootState';
import { dataStoreQueryRequest, dataStoreQueryResponse } from '../../../messaging/datastore.workerMessages';
import { DatastoreContext } from '../../DatastoreContext';
import { executeDataStoreQuery } from './executeDataStoreQuery';

export const doDataStoreQuery = <
    TRootState extends BaseRootState,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TContext extends BaseContext<any> & DatastoreContext<TRootState>
>(
    request: ReturnType<typeof dataStoreQueryRequest>['payload'],
    ctx: TContext
): Promise<ReturnType<typeof dataStoreQueryResponse>> => {
    return new Promise((resolve, reject) => {
        if (!ctx.datastore) {
            reject(new Error('DataStore not initialized.'));
            return;
        }

        const queryObj = executeDataStoreQuery(ctx.datastore.getRootState, request.query);
        resolve(dataStoreQueryResponse(queryObj));
    });
};
