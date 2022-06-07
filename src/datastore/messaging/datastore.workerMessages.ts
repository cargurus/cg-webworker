import { createWorkerMessage, SendableObj, SendableValue } from 'cg-webworker/core';
import { BaseRootState } from './BaseRootState';
import { CompareVal } from './CompareVal';
import { DataStoreFilterResultQueryOp, DataStoreFilterResultQuerySet } from './DataStoreFilterResultQuerySet';
import { Query, query as makeQuery, QueryByPathNode } from './query';

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
export const dataStoreQueryResponse = <T extends SendableValue<any>>(result: T) =>
    createWorkerMessage({
        type: DATASTORE_WORKERMESSAGE_KEYS.DATA_STORE_QUERY,
        payload: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            result: result as SendableValue<any>,
        },
    });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResultSetFilterQuery<TType extends SendableObj<any>> =
    | (({ prop: keyof TType } | { query: (resultType: TType) => CompareVal }) & { eq: CompareVal })
    | (({ prop: keyof TType } | { query: (resultType: TType) => string }) & { matches: RegExp; negate?: boolean })
    | (({ prop: keyof TType } | { query: (resultType: TType) => CompareVal }) & { in: CompareVal[] })
    | (({ prop: keyof TType } | { query: (resultType: TType) => CompareVal }) & { notIn: CompareVal[] })
    | (({ prop: keyof TType } | { query: (resultType: TType) => CompareVal }) & { notEq: CompareVal })
    | (({ prop: keyof TType } | { query: (resultType: TType) => CompareVal }) & { range: Range; negate?: boolean });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dataStoreFilterRequest = <TState extends BaseRootState, TType extends SendableObj<any>>(
    querySet: (state: TState) => DataStoreFilterResultQuerySet<TType>,
    queryParams: {
        filter: {
            predicates: ResultSetFilterQuery<TType>[];
            op: typeof DataStoreFilterResultQueryOp[keyof typeof DataStoreFilterResultQueryOp];
            negate?: boolean;
        };
        map?: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [propName: string]: (resultType: TType) => SendableValue<any>;
        };
        page?: { size: number; index: number };
    }
) => {
    const map = queryParams.map
        ? Object.entries(queryParams.map).reduce((accum, [propName, mapFunction]) => {
              accum[propName] = makeQuery(mapFunction);
              return accum;
          }, {} as Record<string, QueryByPathNode>)
        : undefined;

    const predicates = queryParams.filter.predicates.map((f) =>
        'prop' in f ? f : { ...f, query: makeQuery(f.query) }
    );

    return createWorkerMessage({
        type: DATASTORE_WORKERMESSAGE_KEYS.DATA_STORE_FILTER,
        payload: {
            querySet: makeQuery(querySet),
            queryParams: {
                filter: {
                    ...queryParams.filter,
                    predicates,
                },
                map: map,
                page: queryParams.page,
            },
        },
    });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dataStoreFilterResponse = <TResult extends SendableValue<any>>(result: TResult[]) =>
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
    | ReturnType<typeof dataStoreFilterRequest>
    | ReturnType<typeof dataStoreSubscribeRequest>
    | ReturnType<typeof dataStoreUnsubscribeRequest>
    | ReturnType<typeof dataStoreChangeNotifySubscribeRequest>
    | ReturnType<typeof dataStoreChangeNotifyUnsubscribeRequest>;
export type DataStoreQueryResponseActions =
    | ReturnType<typeof dataStoreQueryResponse>
    | ReturnType<typeof dataStoreFilterResponse>
    | ReturnType<typeof dataStoreSubscribeResponse>
    | ReturnType<typeof dataStoreUnsubscribeResponse>
    | ReturnType<typeof dataStoreChangeNotifySubscribeResponse>
    | ReturnType<typeof dataStoreChangeNotifyUnsubscribeResponse>;
