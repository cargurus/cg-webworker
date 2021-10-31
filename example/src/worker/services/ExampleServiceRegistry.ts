import { DatastoreServiceRegistry } from 'cg-webworker/datastore';
import { WORKER_MESSAGE_TYPES } from '../messages';
import { sortAndFilterService } from './sortAndFilterService';
import { loadDataService } from './loadDataService';
import { aggregateBookCollectionInfo } from './aggregateBookCollectionInfo';
import { generateWordCloudService } from './generateWordCloud';

export const ExampleServiceRegistry = {
    [WORKER_MESSAGE_TYPES.FILTER_AND_SORT]: sortAndFilterService,
    [WORKER_MESSAGE_TYPES.LOAD_BOOKS]: loadDataService,
    [WORKER_MESSAGE_TYPES.GET_BOOK_COLLECTION_INFO]: aggregateBookCollectionInfo,
    [WORKER_MESSAGE_TYPES.WORD_CLOUD_GENERATE]: generateWordCloudService,
    ...DatastoreServiceRegistry,
};
