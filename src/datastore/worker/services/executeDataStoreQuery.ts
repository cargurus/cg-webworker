import { BaseRootState } from '../../messaging/BaseRootState';
import { Query } from '../../messaging/query';
import { executeDataStoreQueryByProps } from './executeDataStoreQueryByProps';
import { executeDataStoreQueryByProxy } from './executeDataStoreQueryByProxy';

export function executeDataStoreQuery<TRootState extends BaseRootState>(getRootState: () => TRootState, query: Query) {
    switch (query.q) {
        case 'keys':
            return executeDataStoreQueryByProps(getRootState, query.query);
        case 'proxy':
        default:
            return executeDataStoreQueryByProxy(getRootState, query.path);
    }
}
