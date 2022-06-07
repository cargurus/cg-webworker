import { SendableObj } from 'cg-webworker/core';
import { CompareVal } from '../../../messaging/CompareVal';
import { DataStoreFilterResultQueryOp } from '../../../messaging/DataStoreFilterResultQuerySet';
import { QueryByPathNode } from '../../../messaging/query';
import { createResultFilter } from './createResultFilter';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResultSetFilter<TType extends SendableObj<any>> =
    | (({ prop: keyof TType } | { query: QueryByPathNode }) & { eq: CompareVal })
    | (({ prop: keyof TType } | { query: QueryByPathNode }) & { notEq: CompareVal })
    | (({ prop: keyof TType } | { query: QueryByPathNode }) & { matches: RegExp; negate?: boolean })
    | (({ prop: keyof TType } | { query: QueryByPathNode }) & { in: CompareVal[] })
    | (({ prop: keyof TType } | { query: QueryByPathNode }) & { notIn: CompareVal[] })
    | (({ prop: keyof TType } | { query: QueryByPathNode }) & { range: Range; negate?: boolean });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const filterResultSet = <TType extends SendableObj<any>>(
    result: TType[],
    predicates: ResultSetFilter<TType>[],
    op: typeof DataStoreFilterResultQueryOp[keyof typeof DataStoreFilterResultQueryOp],
    negate: boolean = false
): TType[] => {
    return result.filter(createResultFilter(predicates, op, negate));
};
