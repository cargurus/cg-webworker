import { BaseRootState } from '../../messaging/BaseRootState';
import { QueryKey } from '../../messaging/makeQuery';

export function executeDataStoreQuery<TRootState extends BaseRootState>(
    getRootState: () => TRootState,
    query: QueryKey[]
) {
    if (!Array.isArray(query)) {
        throw new Error(`'query' must be Array of QueryKeys`);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let queryObj: Record<string, any> | Map<any, any> | Set<any> = getRootState();

    query.forEach((queryParam, queryKeyDepth) => {
        if (queryObj instanceof Map) {
            if (Array.isArray(queryParam)) {
                if (query.length > queryKeyDepth + 1) {
                    // Throw an error if trying to drilldown into properties of multiple objects
                    // Therefore if we still have more query keys to process at this point, we can throw
                    throw new Error('Cannot navigate nested properties');
                }
                queryObj = queryParam.reduce((accum, q) => {
                    if (!queryObj.has(q)) {
                        return accum;
                    }
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    accum.set(q, (queryObj as Map<any, any>).get(q));
                    return accum;
                }, new Map());
            } else if (queryParam instanceof Date) {
                queryObj = queryObj.get(queryParam);
            } else if (typeof queryParam === 'object') {
                throw new Error('Cannot pass Object as query param path arg.');
            } else {
                queryObj = queryObj.get(queryParam);
            }
        } else if (queryObj instanceof Set) {
            throw new Error('Set support not yet implemented');
        } else if (typeof queryObj === 'object') {
            switch (typeof queryParam) {
                case 'string':
                case 'number':
                    if (queryParam in queryObj) {
                        queryObj = queryObj[queryParam];
                        break;
                    } else {
                        throw new Error(`Prop "${queryParam}" not found on query path in dataStore`);
                    }
                default:
                    throw new Error(`Query param type unsupported: ${typeof queryParam} - ${queryParam}`);
            }
        } else {
            throw new Error(`Trying to query into unqueryable type: ${typeof queryObj}`);
        }
    });

    return queryObj;
}
