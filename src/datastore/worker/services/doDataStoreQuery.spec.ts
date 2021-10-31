import { BaseContext } from 'cg-webworker/core';
import { dataStoreQueryRequest, QueryKey } from '../../messaging';
import { DatastoreContext } from '../DatastoreContext';
import { DataStoreSubscriberService } from '../DatastoreSubscriberService';
import { doDataStoreQuery } from './doDataStoreQuery';

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

describe('doDataStoreQuery', () => {
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

    it('should fail if datastore not initialized', async () => {
        (context as any).datastore = undefined;
        await expect(doDataStoreQuery(dataStoreQueryRequest(['listingPerformances']).payload, context)).rejects.toEqual(
            new Error('DataStore not initialized.')
        );
    });

    it('should fail at root node retrieval', async () => {
        await expect(doDataStoreQuery(dataStoreQueryRequest([]).payload, context)).rejects.toEqual(
            new Error('No query specified')
        );
        await expect(
            doDataStoreQuery(dataStoreQueryRequest(null as unknown as QueryKey[]).payload, context)
        ).rejects.toEqual(new Error('No query specified'));
        await expect(
            doDataStoreQuery(dataStoreQueryRequest({} as unknown as QueryKey[]).payload, context)
        ).rejects.toEqual(new Error(`'query' must be Array of QueryKeys`));
    });

    it('should return a simple prop query at depth 1', async () => {
        const result = await doDataStoreQuery(dataStoreQueryRequest(['listingPerformances']).payload, context);
        expect(result.payload).toStrictEqual(dataStore.listingPerformances);
    });

    it('should return a simple prop query at depth 2', async () => {
        const result = await doDataStoreQuery(
            dataStoreQueryRequest(['listingPerformances', 'byListingId']).payload,
            context
        );
        expect(result.payload).toStrictEqual(dataStore.listingPerformances.byListingId);
    });

    it('should query a map with a single value', async () => {
        const result = await doDataStoreQuery(
            dataStoreQueryRequest(['listingPerformances', 'byListingId', 1111]).payload,
            context
        );
        expect(result.payload).toStrictEqual({
            listingId: 1111,
            connections: {
                email: 5,
                phone: 3,
            },
            saves: 101,
            lastUpdate: null,
        });
    });

    it('should query a map with multiple values', async () => {
        const result = await doDataStoreQuery(dataStoreQueryRequest(['listings', [1234, 1235]]).payload, context);
        expect(result.payload).toStrictEqual(
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

    it('should return just the existent values when querying a map', async () => {
        const result = await doDataStoreQuery(dataStoreQueryRequest(['listings', [1234, 1235, 1236]]).payload, context);
        expect(result.payload).toStrictEqual(
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

    it('should dig down through a map with single value', async () => {
        const result = await doDataStoreQuery(
            dataStoreQueryRequest(['listingPerformances', 'byListingId', 1111, 'saves']).payload,
            context
        );
        expect(result.payload).toEqual(101);
    });

    it('should throw an error when trying to dig down through a map with multiple query values', async () => {
        await expect(
            doDataStoreQuery(
                dataStoreQueryRequest(['listingPerformances', 'byListingId', [1111, 1234], 'saves']).payload,
                context
            )
        ).rejects.toEqual(new Error('Cannot navigate nested properties'));
    });
});
