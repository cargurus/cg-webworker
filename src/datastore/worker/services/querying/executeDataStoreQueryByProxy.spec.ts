import { BaseContext } from 'cg-webworker/core';
import { query, Query, QueryPathNode } from '../../../messaging/query';
import { DatastoreContext } from '../../DatastoreContext';
import { DataStoreSubscriberService } from '../../DatastoreSubscriberService';
import { executeDataStoreQueryByProxy } from './executeDataStoreQueryByProxy';

describe('executeDataStoreQueryByProxy', () => {
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
        config: {
            accountReady: boolean;
            name: string;
            products: number[];
        };
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
            config: {
                accountReady: true,
                name: 'Great Place',
                products: [4, 5, 6, 7],
            },
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

    it('should fail at root node retrieval', async () => {
        expect(() => executeDataStoreQueryByProxy(context.datastore.getRootState(), [])).toThrowError(
            new Error(`'query' must have at least one QueryPathNode`)
        );
        expect(() =>
            executeDataStoreQueryByProxy(context.datastore.getRootState(), null as unknown as QueryPathNode[])
        ).toThrowError(new Error(`'query' is required`));
        expect(() =>
            executeDataStoreQueryByProxy(context.datastore.getRootState(), {} as unknown as QueryPathNode[])
        ).toThrowError(new Error(`'query' must be Array of QueryPathNode`));
    });

    it('should return collection items for Map types', () => {
        expect(
            executeDataStoreQueryByProxy(
                context.datastore.getRootState(),
                query((state: ExampleDataStore) => state.listingPerformances.byListingId.get(1111)).path
            )
        ).toEqual({
            listingId: 1111,
            connections: {
                email: 5,
                phone: 3,
            },
            saves: 101,
            lastUpdate: null,
        });
    });

    it('should return entire Map when desired', () => {
        expect(
            executeDataStoreQueryByProxy(
                context.datastore.getRootState(),
                query((state: ExampleDataStore) => state.listings).path
            )
        ).toEqual(
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

    it('should return Map props', () => {
        expect(
            executeDataStoreQueryByProxy(
                context.datastore.getRootState(),
                query((state: ExampleDataStore) => state.listings.size).path
            )
        ).toEqual(2);
    });

    it('should return Map queries', () => {
        expect(
            executeDataStoreQueryByProxy(
                context.datastore.getRootState(),
                query((state: ExampleDataStore) => state.listings.has(1234)).path
            )
        ).toEqual(true);
        expect(
            executeDataStoreQueryByProxy(
                context.datastore.getRootState(),
                query((state: ExampleDataStore) => state.listings.has(1236)).path
            )
        ).toEqual(false);
    });

    it('should return iterators as arrays', () => {
        expect(
            executeDataStoreQueryByProxy(
                context.datastore.getRootState(),
                query((state: ExampleDataStore) => state.listings.keys()).path
            )
        ).toEqual([1234, 1235]);
        expect(
            executeDataStoreQueryByProxy(
                context.datastore.getRootState(),
                query((state: ExampleDataStore) => state.listings.values()).path
            )
        ).toEqual([
            {
                id: 1234,
                name: 'Cool Car w/ Great Engine',
                carMaker: 'Maker A',
                carModel: 'Model A',
                carYear: 2010,
            },
            {
                id: 1235,
                name: 'Old Car w/ Beat Engine',
                carMaker: 'Maker b',
                carModel: 'Model b',
                carYear: 2006,
            },
        ]);
    });

    it('should return indexes in an array', () => {
        expect(
            executeDataStoreQueryByProxy(
                context.datastore.getRootState(),
                query((state: ExampleDataStore) => state.config.products[0]).path
            )
        ).toEqual(4);
        expect(
            executeDataStoreQueryByProxy(
                context.datastore.getRootState(),
                query((state: ExampleDataStore) => state.config.products[3]).path
            )
        ).toEqual(7);
    });
    it('should return undefined for non-existent array index', () => {
        expect(
            executeDataStoreQueryByProxy(
                context.datastore.getRootState(),
                query((state: ExampleDataStore) => state.config.products[4]).path
            )
        ).toEqual(undefined);
        expect(
            executeDataStoreQueryByProxy(
                context.datastore.getRootState(),
                query((state: ExampleDataStore) => state.config.products[-1]).path
            )
        ).toEqual(undefined);
    });

    it('should return obj', () => {
        expect(
            executeDataStoreQueryByProxy(
                context.datastore.getRootState(),
                query((state: ExampleDataStore) => state.config).path
            )
        ).toEqual({
            accountReady: true,
            name: 'Great Place',
            products: [4, 5, 6, 7],
        });
    });
    it('should return props of obj', () => {
        expect(
            executeDataStoreQueryByProxy(
                context.datastore.getRootState(),
                query((state: ExampleDataStore) => state.config.accountReady).path
            )
        ).toEqual(true);
    });
    it("should return undefined when obj prop doesn't exist", () => {
        expect(
            executeDataStoreQueryByProxy(
                context.datastore.getRootState(),
                query((state: ExampleDataStore) => (state.config as any).nonExist).path
            )
        ).toEqual(undefined);
    });
});
