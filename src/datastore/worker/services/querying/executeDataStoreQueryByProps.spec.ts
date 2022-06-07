import { BaseContext } from 'cg-webworker/core';
import { QueryKey } from '../../../messaging/QueryKey';
import { dataStoreQueryRequest, Query } from '../../../messaging';
import { DatastoreContext } from '../../DatastoreContext';
import { DataStoreSubscriberService } from '../../DatastoreSubscriberService';
import { executeDataStoreQueryByProps } from './executeDataStoreQueryByProps';

describe('executeDataStoreQueryByPropsByProps', () => {
    type ExampleDataStore = {
        listingPerformances: {
            byListingId: Map<
                number,
                {
                    listingId: number;
                    connections: {
                        email: number;
                        phone: number;
                    };
                    saves: number;
                    lastUpdate: Date | null;
                }
            >;
        };
        listings: Map<
            number,
            {
                id: number;
                name: string;
                carMaker: string;
                carModel: string;
                carYear: number;
            }
        >;
    };

    let dataStore: ExampleDataStore;
    let context: BaseContext<any> & DatastoreContext<ExampleDataStore>;

    beforeEach(() => {
        dataStore = {
            listingPerformances: {
                byListingId: new Map([
                    [
                        1111,
                        {
                            listingId: 1111,
                            connections: {
                                email: 5,
                                phone: 3,
                            },
                            saves: 101,
                            lastUpdate: null,
                        },
                    ],
                ]),
            },
            listings: new Map([
                [
                    1234,
                    {
                        id: 1234,
                        name: 'Cool Car w/ Great Engine',
                        carMaker: 'Maker A',
                        carModel: 'Model A',
                        carYear: 2010,
                    },
                ],
                [
                    1235,
                    {
                        id: 1235,
                        name: 'Old Car w/ Beat Engine',
                        carMaker: 'Maker b',
                        carModel: 'Model b',
                        carYear: 2006,
                    },
                ],
            ]),
        } as ExampleDataStore;
        context = {
            datastore: new DataStoreSubscriberService(() => dataStore, jest.fn()),
            worker: {} as any,
            logToConsole: false,
            workerState: {
                queue: [],
                mapCompatibility: true,
                refererCompatibility: true,
                ready: false,
            },
        };
    });

    it('should fail at root node retrieval', () => {
        expect(() => executeDataStoreQueryByProps(context.datastore.getRootState, [])).toThrowError(
            new Error('No query specified')
        );
        expect(() =>
            executeDataStoreQueryByProps(context.datastore.getRootState, null as unknown as QueryKey[])
        ).toThrowError(new Error('No query specified'));
        expect(() =>
            executeDataStoreQueryByProps(context.datastore.getRootState, {} as unknown as QueryKey[])
        ).toThrowError(new Error(`'query' must be Array of QueryKeys`));
    });

    it('should return a simple prop query at depth 1', () => {
        const result = executeDataStoreQueryByProps(context.datastore.getRootState, ['listingPerformances']);
        expect(result).toStrictEqual(dataStore.listingPerformances);
    });

    it('should return a simple prop query at depth 2', () => {
        const result = executeDataStoreQueryByProps(context.datastore.getRootState, [
            'listingPerformances',
            'byListingId',
        ]);
        expect(result).toStrictEqual(dataStore.listingPerformances.byListingId);
    });

    it('should query a map with a single value', () => {
        const result = executeDataStoreQueryByProps(context.datastore.getRootState, [
            'listingPerformances',
            'byListingId',
            1111,
        ]);
        expect(result).toStrictEqual({
            listingId: 1111,
            connections: {
                email: 5,
                phone: 3,
            },
            saves: 101,
            lastUpdate: null,
        });
    });

    it('should query a map with multiple values', () => {
        const result = executeDataStoreQueryByProps(context.datastore.getRootState, ['listings', [1234, 1235]]);
        expect(result).toStrictEqual(
            new Map([
                [
                    1234,
                    {
                        id: 1234,
                        name: 'Cool Car w/ Great Engine',
                        carMaker: 'Maker A',
                        carModel: 'Model A',
                        carYear: 2010,
                    },
                ],
                [
                    1235,
                    {
                        id: 1235,
                        name: 'Old Car w/ Beat Engine',
                        carMaker: 'Maker b',
                        carModel: 'Model b',
                        carYear: 2006,
                    },
                ],
            ])
        );
    });

    it('should return just the existent values when querying a map', () => {
        const result = executeDataStoreQueryByProps(context.datastore.getRootState, ['listings', [1234, 1235, 1236]]);
        expect(result).toStrictEqual(
            new Map([
                [
                    1234,
                    {
                        id: 1234,
                        name: 'Cool Car w/ Great Engine',
                        carMaker: 'Maker A',
                        carModel: 'Model A',
                        carYear: 2010,
                    },
                ],
                [
                    1235,
                    {
                        id: 1235,
                        name: 'Old Car w/ Beat Engine',
                        carMaker: 'Maker b',
                        carModel: 'Model b',
                        carYear: 2006,
                    },
                ],
            ])
        );
    });

    it('should dig down through a map with single value', () => {
        const result = executeDataStoreQueryByProps(context.datastore.getRootState, [
            'listingPerformances',
            'byListingId',
            1111,
            'saves',
        ]);
        expect(result).toEqual(101);
    });

    it('should throw an error when trying to dig down through a map with multiple query values', () => {
        expect(() =>
            executeDataStoreQueryByProps(context.datastore.getRootState, [
                'listingPerformances',
                'byListingId',
                [1111, 1234],
                'saves',
            ])
        ).toThrowError(new Error('Cannot navigate nested properties'));
    });
});
