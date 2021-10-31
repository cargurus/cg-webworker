import { createWorkerMessage } from 'cg-webworker/core';
import { BookInfo } from '../domain/book';
import { SortDir, sortKeys } from '../domain/sortKeys';

export const WORKER_MESSAGE_TYPES = {
    FILTER_AND_SORT: 'FILTER_AND_SORT/ALL',
    GET_BOOK_COLLECTION_INFO: 'BOOKS/GET_INFO',
    LOAD_BOOKS: 'BOOKS/LOAD',
    WORD_CLOUD_GENERATE: 'BOOK/WORD_CLOUD/GENERATE',
} as const;

export const doSortAndFilterRequest = (
    filter: {
        titleContains?: string;
        contentsContains?: string;
        authors?: string[];
        publishers?: string[];
        publishDates?: { min?: Date | null; max?: Date | null };
        bookLength?: { min?: number | null; max?: number | null };
    } | null,
    sort: { key: typeof sortKeys[keyof typeof sortKeys]; dir: SortDir },
    pageIndex: number,
    pageSize: number
) =>
    createWorkerMessage({
        type: WORKER_MESSAGE_TYPES.FILTER_AND_SORT,
        payload: {
            filter,
            sort,
            pageIndex,
            pageSize,
        },
    });

export const doSortAndFilterResponse = (
    results: BookInfo[],
    totalResults: number,
    bookContentsById: Map<string, ArrayBuffer>
) =>
    createWorkerMessage({
        type: WORKER_MESSAGE_TYPES.FILTER_AND_SORT,
        payload: {
            results,
            totalResults,
            bookContentsById,
        },
        transferrables: Array.from(bookContentsById.values()),
    });

export const doLoadDataRequest = (count: number) =>
    createWorkerMessage({
        type: WORKER_MESSAGE_TYPES.LOAD_BOOKS,
        payload: {
            count,
        },
    });
export const doLoadDataResponse = () =>
    createWorkerMessage({
        type: WORKER_MESSAGE_TYPES.LOAD_BOOKS,
        payload: {},
    });

export const getBookCollectionInfoRequest = () =>
    createWorkerMessage({
        type: WORKER_MESSAGE_TYPES.GET_BOOK_COLLECTION_INFO,
        payload: {},
    });
export const getBookCollectionInfoResponse = (
    results: null | {
        authors: Map<string, number>;
        publishers: Map<string, number>;
        bookLengths: { min: number; max: number };
        publishDates: { min: Date; max: Date };
        total: number;
    }
) =>
    createWorkerMessage({
        type: WORKER_MESSAGE_TYPES.GET_BOOK_COLLECTION_INFO,
        payload:
            results == null
                ? ({ ready: false } as { ready: false })
                : ({
                      ready: true,
                      ...results,
                  } as typeof results & { ready: true }),
    });

export const wordCloudGenerateRequest = (
    canvas: OffscreenCanvas,
    bookId: string,
    width: number,
    height: number,
    maxWords: number,
    minWordLength: number,
    minWordPlotSize: number,
    maxWordPlotSize: number
) =>
    createWorkerMessage({
        type: WORKER_MESSAGE_TYPES.WORD_CLOUD_GENERATE,
        payload: {
            canvas,
            bookId,
            width,
            height,
            maxWords,
            minWordLength,
            minWordPlotSize,
            maxWordPlotSize,
        },
        transferrables: [canvas],
    });
export const wordCloudGenerateResponse = () =>
    createWorkerMessage({
        type: WORKER_MESSAGE_TYPES.WORD_CLOUD_GENERATE,
        payload: {},
    });
