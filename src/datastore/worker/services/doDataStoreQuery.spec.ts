import { BaseContext } from 'cg-webworker/core';
import { dataStoreQueryRequest, Query } from '../../messaging';
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
        await expect(
            doDataStoreQuery(dataStoreQueryRequest({ q: 'keys', query: ['listingPerformances'] }).payload, context)
        ).rejects.toEqual(new Error('DataStore not initialized.'));
    });
});
