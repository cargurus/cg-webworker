import { BaseRootState } from '../../messaging/BaseRootState';
import { QueryPathNode } from '../../messaging/query';

function isNumeric(str: string): boolean {
    // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    return !isNaN(str as unknown as number) && !isNaN(parseFloat(str));
}

export function executeDataStoreQueryByProxy<TRootState extends BaseRootState>(
    getRootState: () => TRootState,
    query: QueryPathNode[]
) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rootState: Record<string, any> | Map<any, any> | Set<any> = getRootState();
    if (rootState == null) {
        throw new Error('Root state is null/undefined.');
    }

    if (query == null) {
        throw new Error(`'query' is required`);
    }

    if (!Array.isArray(query)) {
        throw new Error(`'query' must be Array of QueryPathNode`);
    }

    if (query.length === 0) {
        throw new Error(`'query' must have at least one QueryPathNode`);
    }

    const iterablesToExpand = new Set<Function>([
        Array.prototype.keys,
        Map.prototype.keys,
        Set.prototype.keys,
        Array.prototype.values,
        Map.prototype.values,
        Set.prototype.values,
    ]);

    let queryObj = rootState;

    let owningObj = queryObj;
    query.forEach((q, i) => {
        if (queryObj == null) {
            throw new Error(`Value at depth ${i - 1} is null/undefined.`);
        }
        if (typeof queryObj !== 'function') {
            owningObj = queryObj;
        }
        switch (q.type) {
            case 'FUNC': {
                if (typeof queryObj !== 'function') {
                    throw new Error(`Found non-function for FUNC type at depth ${i}.`);
                }
                const expand = iterablesToExpand.has(queryObj);
                queryObj = queryObj.apply(owningObj, q.argumentsList);
                if (expand) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    queryObj = Array.from(queryObj as Iterable<any>);
                }
                break;
            }
            case 'PROP':
            default: {
                if (queryObj instanceof Array || Array.isArray(queryObj)) {
                    if (q.propKey in queryObj) {
                        if (isNumeric(q.propKey)) {
                            queryObj = queryObj[Number(q.propKey)];
                        } else {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            queryObj = queryObj[q.propKey];
                        }
                    } else {
                        throw new Error(`Index ${q.propKey} at query depth ${i} not found in array.`);
                    }
                } else if (typeof queryObj === 'object') {
                    if (q.propKey in queryObj) {
                        queryObj = queryObj[q.propKey];
                    } else {
                        throw new Error(`Prop/index '${q.propKey}' at query depth ${i} not found.`);
                    }
                } else {
                    throw new Error(`Unsupported collection/prop type encountered at depth ${i}: ${typeof queryObj}`);
                }
                break;
            }
        }
    });

    return queryObj;
}
