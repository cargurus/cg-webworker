import { SendableValue } from 'cg-webworker/core';
import { BaseRootState } from './BaseRootState';
import { QueryKey } from './QueryKey';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const query = <TState extends BaseRootState>(
    traverseFunc: (state: TState) => SendableValue<any>
): QueryByPathNode => {
    const query: Query = { q: 'proxy', path: [] };

    const nestedProxy = new Proxy(() => {}, {
        get(target, propKey) {
            if (typeof propKey === 'symbol') {
                throw new Error(`Can't reference symbols in query.`);
            }
            query.path.push({ type: 'PROP', propKey: propKey });
            return nestedProxy;
        },
        apply: function (target, thisArg, argumentsList) {
            if (argumentsList.some((a) => typeof a === 'function' || typeof a === 'symbol')) {
                throw new Error('Functions and symbols cannot be passed as arguments.');
            }
            query.path.push({ type: 'FUNC', argumentsList: argumentsList });
            return nestedProxy;
        },
    }) as unknown as TState;

    const rootProxy = new Proxy(() => {}, {
        get(target, propKey) {
            if (typeof propKey === 'symbol') {
                throw new Error(`Can't reference symbols in query.`);
            }
            if (query.path.length !== 0) {
                throw new Error('Can only reference state once when creating query.');
            }
            query.path.push({ type: 'PROP', propKey: propKey });
            return nestedProxy;
        },
        apply(target, thisArg, argumentsList) {
            if (query.path.length !== 0) {
                throw new Error('Can only reference state once when creating query.');
            }
            if (argumentsList.some((a) => typeof a === 'function' || typeof a === 'symbol')) {
                throw new Error('Functions and symbols cannot be passed as arguments.');
            }
            query.path.push({ type: 'FUNC', argumentsList: argumentsList });
            return nestedProxy;
        },
    }) as unknown as TState;

    traverseFunc(rootProxy);

    return query;
};

export type QueryPathNode = { type: 'FUNC'; argumentsList: QueryKey[] } | { type: 'PROP'; propKey: string };
export type QueryByPathNode = {
    q: 'proxy';
    path: QueryPathNode[];
};
export type QueryByPropKey = { q: 'keys'; query: QueryKey[] };
export type Query = QueryByPathNode | QueryByPropKey;
