import { BaseContext, SendableValue } from 'cg-webworker/core';
import { BaseRootState } from '../../../messaging/BaseRootState';
import { dataStoreFilterRequest, dataStoreFilterResponse } from '../../../messaging/datastore.workerMessages';
import { DataStoreFilterResultQuerySet } from '../../../messaging/DataStoreFilterResultQuerySet';
import { DatastoreContext } from '../../DatastoreContext';
import { executeDataStoreQuery } from '../querying/executeDataStoreQuery';
import { executeDataStoreQueryByProxy } from '../querying/executeDataStoreQueryByProxy';
import { filterResultSet } from './filterResultSet';

export const doDataStoreFilter = <
    TRootState extends BaseRootState,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TContext extends BaseContext<any> & DatastoreContext<TRootState>
>(
    request: ReturnType<typeof dataStoreFilterRequest>['payload'],
    ctx: TContext
): Promise<ReturnType<typeof dataStoreFilterResponse>> => {
    return new Promise((resolve, reject) => {
        if (!ctx) {
            reject(new Error('No context provided.'));
            return;
        }
        if (!ctx.datastore) {
            reject(new Error('DataStore not initialized.'));
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queryResult = executeDataStoreQuery(
            ctx.datastore.getRootState,
            request.querySet
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as DataStoreFilterResultQuerySet<any>;
        const isArray = queryResult instanceof Array || Array.isArray(queryResult);

        let result = isArray ? queryResult : Array.from(queryResult);

        const { filter, map, page } = request.queryParams;
        result = filterResultSet(result, filter.predicates, filter.op, filter.negate);

        if (map) {
            result = result.map((r) => {
                return Object.entries(map).reduce((accum, [propName, query]) => {
                    accum[propName] = executeDataStoreQueryByProxy(r, query.path);
                    return accum;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                }, {} as Record<string, SendableValue<any>>);
            });
        }

        if (page) {
            const startIndex = page.index * page.size;
            result = result.slice(startIndex, startIndex + page.size);
        }

        resolve(dataStoreFilterResponse(result));
    });
};
