import { Query } from './query';
import { BaseRootState } from './BaseRootState';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapResultOrKeyOf<T> = T extends ReadonlyMap<infer U, any>
    ? Exclude<U, symbol> | Exclude<U, symbol>[]
    : Exclude<keyof T, symbol>;

type Q1<TRootState extends BaseRootState> = Exclude<keyof TRootState, symbol>;
type Q2<TRootState extends BaseRootState, T extends Q1<TRootState>> = Exclude<keyof TRootState[T], symbol>;
type Q3<TRootState extends BaseRootState, T1 extends Q1<TRootState>, T2 extends Q2<TRootState, T1>> = MapResultOrKeyOf<
    TRootState[T1][T2]
>;
type Q4<
    TRootState extends BaseRootState,
    T1 extends Q1<TRootState>,
    T2 extends Q2<TRootState, T1>,
    T3 extends Q3<TRootState, T1, T2>
> = T3 extends keyof TRootState[T1][T2] ? MapResultOrKeyOf<TRootState[T1][T2][T3]> : never;

export function queryByProps<
    TRootState extends BaseRootState,
    T1 extends Q1<TRootState>,
    T2 extends Q2<TRootState, T1>
>(_: TRootState, a: T1, b: T2): Query;
export function queryByProps<
    TRootState extends BaseRootState,
    T1 extends Q1<TRootState>,
    T2 extends Q2<TRootState, T1>,
    T3 extends Q3<TRootState, T1, T2>
>(_: TRootState, a: T1, b: T2, c: T3): Query;
export function queryByProps<
    TRootState extends BaseRootState,
    T1 extends Q1<TRootState>,
    T2 extends Q2<TRootState, T1>,
    T3 extends Q3<TRootState, T1, T2>,
    T4 extends Q4<TRootState, T1, T2, T3>
>(_: TRootState, a: T1, b: T2, c: T3, d: T4): Query;
export function queryByProps<
    TRootState extends BaseRootState,
    T1 extends Q1<TRootState>,
    T2 extends Q2<TRootState, T1>,
    T3 extends Q3<TRootState, T1, T2>,
    T4 extends Q4<TRootState, T1, T2, T3>
>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: TRootState,
    ...queryArgs: [T1] | [T1, T2] | [T1, T2, T3] | [T1, T2, T3, T4]
): Query {
    return { q: 'keys', query: queryArgs };
}
