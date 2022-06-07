import { CompareVal } from './CompareVal';

type RangeLt = { lt: CompareVal };
type RangeLte = { lte: CompareVal };
type RangeGt = { gt: CompareVal };
type RangeGte = { gte: CompareVal };
export type Range =
    | ((RangeLt | RangeLte) & Partial<RangeGt | RangeGte>)
    | ((RangeGt | RangeGte) & Partial<RangeLt | RangeLte>);
