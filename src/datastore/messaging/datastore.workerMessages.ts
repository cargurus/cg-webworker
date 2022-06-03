import { createWorkerMessage, SendableObj, SendableValue } from 'cg-webworker/core';
import { BaseRootState } from './BaseRootState';
import { Query, query as makeQuery } from './query';

export const DATASTORE_WORKERMESSAGE_KEYS = {
    /**
     * Simple query for data from a node
     */
    DATA_STORE_QUERY: 'DATASTORE/QUERY/START',
    /**
     * Filter data from a node
     */
    DATA_STORE_FILTER: 'DATASTORE/FILTER',
    /**
     * Subscribe to be receive updated data when data changes at a node
     */
    DATA_STORE_SUBSCRIBE: 'DATASTORE/SUBSCRIBER/SUBSCRIBE',
    /**
     * Unsubscribe from receiving updated data when data changes
     */
    DATA_STORE_UNSUBSCRIBE: 'DATASTORE/SUBSCRIBER/UNSUBSCRIBE',

    /**
     * Subscribe to be notified when data changes at a node
     */
    DATA_STORE_CHANGE_NOTIFY_SUBSCRIBE: 'DATASTORE/CHANGE_NOTIFY_SUBSCRIBER/SUBSCRIBE',
    /**
     * Unsubscribe from notifications when data changes at a node
     */
    DATA_STORE_CHANGE_NOTIFY_UNSUBSCRIBE: 'DATASTORE/CHANGE_NOTIFY_SUBSCRIBER/UNSUBSCRIBE',
} as const;

export const dataStoreQueryRequest = (query: Query) =>
    createWorkerMessage({
        type: DATASTORE_WORKERMESSAGE_KEYS.DATA_STORE_QUERY,
        payload: {
            query,
        },
    });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dataStoreQueryResponse = <T extends SendableObj<any>>(resultObject: T) =>
    createWorkerMessage({
        type: DATASTORE_WORKERMESSAGE_KEYS.DATA_STORE_QUERY,
        payload: resultObject,
    });

type CompareVal = string | number | Date | boolean | null | undefined;
type RangeLt = { lt: CompareVal };
type RangeLte = { lte: CompareVal };
type RangeGt = { gt: CompareVal };
type RangeGte = { gte: CompareVal };
type Range =
    | ((RangeLt | RangeLte) & Partial<RangeGt | RangeGte>)
    | ((RangeGt | RangeGte) & Partial<RangeLt | RangeLte>);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dataStoreFilterRequest = <TState extends BaseRootState, TType extends SendableValue<any>>(
    querySet: (state: TState) => TType[],
    query: {
        filter: (
            | { prop: keyof TType; eq: CompareVal }
            | { prop: keyof TType; matches: RegExp }
            | { prop: keyof TType; in: CompareVal[] }
            | { prop: keyof TType; notIn: CompareVal[] }
            | { prop: keyof TType; notEq: CompareVal }
            | { prop: keyof TType; range: Range; negate?: boolean }
        )[];
        map?: {};
        page?: { size: number; index: number };
    }
) =>
    createWorkerMessage({
        type: DATASTORE_WORKERMESSAGE_KEYS.DATA_STORE_FILTER,
        payload: {
            querySet: makeQuery(querySet),
            query,
        },
    });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dataStoreFilterResponse = <TResult extends SendableObj<TResult>>(result: TResult[]) =>
    createWorkerMessage({
        type: DATASTORE_WORKERMESSAGE_KEYS.DATA_STORE_FILTER,
        payload: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            result: result as SendableValue<any>,
        },
    });

export const dataStoreSubscribeRequest = (subscriberId: string, query: Query) =>
    createWorkerMessage({
        type: DATASTORE_WORKERMESSAGE_KEYS.DATA_STORE_SUBSCRIBE,
        payload: {
            subscriberId,
            query,
        },
    });

export const dataStoreSubscribeResponse = (
    subscriberId: string,
    data: SendableValue<any> // eslint-disable-line @typescript-eslint/no-explicit-any
) =>
    createWorkerMessage({
        type: DATASTORE_WORKERMESSAGE_KEYS.DATA_STORE_SUBSCRIBE,
        payload: {
            subscriberId,
            current: data as SendableValue<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
        },
    });

export const dataStoreUnsubscribeRequest = (subscriberId: string) =>
    createWorkerMessage({
        type: DATASTORE_WORKERMESSAGE_KEYS.DATA_STORE_UNSUBSCRIBE,
        payload: {
            subscriberId,
        },
    });

export const dataStoreUnsubscribeResponse = () =>
    createWorkerMessage({
        type: DATASTORE_WORKERMESSAGE_KEYS.DATA_STORE_UNSUBSCRIBE,
        payload: {},
    });

export const dataStoreChangeNotifySubscribeRequest = (subscriberId: string, query: Query) =>
    createWorkerMessage({
        type: DATASTORE_WORKERMESSAGE_KEYS.DATA_STORE_CHANGE_NOTIFY_SUBSCRIBE,
        payload: {
            subscriberId,
            query,
        },
    });
export const dataStoreChangeNotifySubscribeResponse = () =>
    createWorkerMessage({
        type: DATASTORE_WORKERMESSAGE_KEYS.DATA_STORE_CHANGE_NOTIFY_SUBSCRIBE,
        payload: {},
    });
export const dataStoreChangeNotifyUnsubscribeRequest = (subscriberId: string) =>
    createWorkerMessage({
        type: DATASTORE_WORKERMESSAGE_KEYS.DATA_STORE_CHANGE_NOTIFY_UNSUBSCRIBE,
        payload: {
            subscriberId,
        },
    });
export const dataStoreChangeNotifyUnsubscribeResponse = () =>
    createWorkerMessage({
        type: DATASTORE_WORKERMESSAGE_KEYS.DATA_STORE_CHANGE_NOTIFY_UNSUBSCRIBE,
        payload: {},
    });

export type DataStoreQueryRequestActions =
    | ReturnType<typeof dataStoreQueryRequest>
    | ReturnType<typeof dataStoreSubscribeRequest>
    | ReturnType<typeof dataStoreUnsubscribeRequest>
    | ReturnType<typeof dataStoreChangeNotifySubscribeRequest>
    | ReturnType<typeof dataStoreChangeNotifyUnsubscribeRequest>;
export type DataStoreQueryResponseActions =
    | ReturnType<typeof dataStoreQueryResponse>
    | ReturnType<typeof dataStoreSubscribeResponse>
    | ReturnType<typeof dataStoreUnsubscribeResponse>
    | ReturnType<typeof dataStoreChangeNotifySubscribeResponse>
    | ReturnType<typeof dataStoreChangeNotifyUnsubscribeResponse>;
