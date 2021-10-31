import { BaseRootState } from './BaseRootState';

export type QueryKey =
    | string
    | number
    | Date
    | null
    | undefined
    | boolean
    | (string | number | Date | null | undefined | boolean)[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapResultOrKeyOf<T> = T extends ReadonlyMap<infer U, any> ? U | U[] : keyof T;

type Q1<TRootState extends BaseRootState> = keyof TRootState;
type Q2<TRootState extends BaseRootState, T extends Q1<TRootState>> = keyof TRootState[T];
type Q3<TRootState extends BaseRootState, T1 extends Q1<TRootState>, T2 extends Q2<TRootState, T1>> = MapResultOrKeyOf<
    TRootState[T1][T2]
>;
type Q4<
    TRootState extends BaseRootState,
    T1 extends Q1<TRootState>,
    T2 extends Q2<TRootState, T1>,
    T3 extends Q3<TRootState, T1, T2>
> = T3 extends keyof TRootState[T1][T2] ? MapResultOrKeyOf<TRootState[T1][T2][T3]> : never;

export function makeQuery<TRootState extends BaseRootState, T1 extends Q1<TRootState>, T2 extends Q2<TRootState, T1>>(
    _: TRootState,
    a: T1,
    b: T2
): [T1, T2];
export function makeQuery<
    TRootState extends BaseRootState,
    T1 extends Q1<TRootState>,
    T2 extends Q2<TRootState, T1>,
    T3 extends Q3<TRootState, T1, T2>
>(_: TRootState, a: T1, b: T2, c: T3): [T1, T2, T3];
export function makeQuery<
    TRootState extends BaseRootState,
    T1 extends Q1<TRootState>,
    T2 extends Q2<TRootState, T1>,
    T3 extends Q3<TRootState, T1, T2>,
    T4 extends Q4<TRootState, T1, T2, T3>
>(_: TRootState, a: T1, b: T2, c: T3, d: T4): [T1, T2, T3, T4];
export function makeQuery<
    TRootState extends BaseRootState,
    T1 extends Q1<TRootState>,
    T2 extends Q2<TRootState, T1>,
    T3 extends Q3<TRootState, T1, T2>,
    T4 extends Q4<TRootState, T1, T2, T3>
>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: TRootState,
    ...queryArgs: [T1] | [T1, T2] | [T1, T2, T3] | [T1, T2, T3, T4]
): [T1] | [T1, T2] | [T1, T2, T3] | [T1, T2, T3, T4] {
    return queryArgs;
}
