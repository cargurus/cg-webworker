import { SendableObj } from 'cg-webworker/core';
import { DataStoreFilterResultQueryOp } from '../../../messaging/DataStoreFilterResultQuerySet';
import { createFilterFuncFromPredicate } from './createFilterFuncFromPredicate';
import { ResultSetFilter } from './filterResultSet';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createResultFilter = <TType extends SendableObj<any>>(
    predicates: ResultSetFilter<TType>[],
    op: typeof DataStoreFilterResultQueryOp[keyof typeof DataStoreFilterResultQueryOp],
    negate: boolean = false
): ((val: TType) => boolean) => {
    const filterFuncs: ((target: TType) => boolean)[] = predicates.map((p) => createFilterFuncFromPredicate(p));
    if (op === DataStoreFilterResultQueryOp.AND) {
        return negate
            ? (target: TType): boolean => !filterFuncs.every((f) => f(target))
            : (target: TType): boolean => filterFuncs.every((f) => f(target));
    } else {
        return negate
            ? (target: TType): boolean => !filterFuncs.some((f) => f(target))
            : (target: TType): boolean => filterFuncs.some((f) => f(target));
    }
};
