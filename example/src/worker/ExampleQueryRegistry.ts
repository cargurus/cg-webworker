import type { WorkerQuery } from 'cg-webworker/core';
import type { DatastoreQueryRegistry } from 'cg-webworker/datastore';
import type {
    doLoadDataRequest,
    doLoadDataResponse,
    doSortAndFilterRequest,
    doSortAndFilterResponse,
    getBookCollectionInfoRequest,
    getBookCollectionInfoResponse,
    wordCloudGenerateRequest,
    wordCloudGenerateResponse,
    WORKER_MESSAGE_TYPES,
} from './messages';

export interface ExampleQueryRegistry extends DatastoreQueryRegistry {
    [WORKER_MESSAGE_TYPES.FILTER_AND_SORT]: WorkerQuery<typeof doSortAndFilterRequest, typeof doSortAndFilterResponse>;
    [WORKER_MESSAGE_TYPES.LOAD_BOOKS]: WorkerQuery<typeof doLoadDataRequest, typeof doLoadDataResponse>;
    [WORKER_MESSAGE_TYPES.GET_BOOK_COLLECTION_INFO]: WorkerQuery<
        typeof getBookCollectionInfoRequest,
        typeof getBookCollectionInfoResponse
    >;
    [WORKER_MESSAGE_TYPES.WORD_CLOUD_GENERATE]: WorkerQuery<
        typeof wordCloudGenerateRequest,
        typeof wordCloudGenerateResponse
    >;
}
