import { BaseRootState } from './BaseRootState';
import { QueryKey } from './QueryKey';

export const query = <TState extends BaseRootState>(traverseFunc: (state: TState) => unknown): Query => {
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
            query.path.push({ type: 'FUNC', argumentsList: argumentsList });
            return nestedProxy;
        },
    }) as unknown as TState;

    traverseFunc(rootProxy);

    return query;
};

export type Query =
    | {
          q: 'proxy';
          path: ({ type: 'FUNC'; argumentsList: QueryKey[] } | { type: 'PROP'; propKey: string })[];
      }
    | { q: 'keys'; query: QueryKey[] };
