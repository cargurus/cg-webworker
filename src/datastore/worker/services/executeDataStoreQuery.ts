import { SendableObj } from 'cg-webworker/core';
import { BaseRootState } from '../../messaging/BaseRootState';
import { Query } from '../../messaging/query';
import { executeDataStoreQueryByProps } from './executeDataStoreQueryByProps';
import { executeDataStoreQueryByProxy } from './executeDataStoreQueryByProxy';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function executeDataStoreQuery<TRootState extends BaseRootState, TResult extends SendableObj<any>>(
    getRootState: () => TRootState,
    query: Query
): TResult {
    switch (query.q) {
        case 'keys':
            return executeDataStoreQueryByProps(getRootState, query.query);
        case 'proxy':
        default:
            return executeDataStoreQueryByProxy(getRootState, query.path);
    }
}
