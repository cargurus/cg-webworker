import { SendableValue } from 'cg-webworker/core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataStoreFilterResultQuerySet<TType extends SendableValue<any>> = TType[] | IterableIterator<TType>;

export const DataStoreFilterResultQueryOp = {
    AND: 'AND',
    OR: 'OR',
} as const;
