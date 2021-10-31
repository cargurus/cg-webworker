import type { QueryKey } from 'cg-webworker/datastore';

export const cloneQuery = (query: QueryKey[]): QueryKey[] => {
    return query.map((q) => (Array.isArray(q) ? q.slice() : q));
};
