import { BaseContext } from 'cg-webworker/core';
import { dataStoreFilterRequest } from '../../../messaging/datastore.workerMessages';
import { dataStoreQueryRequest, Query } from '../../../messaging';
import { DatastoreContext } from '../../DatastoreContext';
import { DataStoreSubscriberService } from '../../DatastoreSubscriberService';
import { doDataStoreFilter } from './doDataStoreFilter';

type ExampleDataStore = {
    listingPerformances: {
        byListingId: Map<
            number,
            {
                listingId: number;
                connections: {
                    email?: number;
                    phone?: number;
                    sms?: number;
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
    cars: {
        makerName: string;
        models: {
            modelName: string;
            years: number[];
        }[];
    }[];
};

describe('doDataStoreFilter', () => {
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
                    [
                        1112,
                        {
                            listingId: 1112,
                            connections: {
                                email: 2,
                                phone: 0,
                                sms: 10,
                            },
                            saves: 9,
                            lastUpdate: new Date(2020, 11, 31, 16, 30, 11),
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
            cars: [
                {
                    makerName: 'Maker A',
                    models: [
                        { modelName: 'Model A', years: [2010, 2011] },
                        { modelName: 'Model A-1', years: [2006, 2007, 2008] },
                    ],
                },
                {
                    makerName: 'Maker b',
                    models: [{ modelName: 'Model b', years: [2005, 2006] }],
                },
                {
                    makerName: 'Maker C',
                    models: [
                        { modelName: 'Fast C', years: [2005, 2006] },
                        { modelName: 'Slow C', years: [2005, 2006] },
                    ],
                },
            ],
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

    it('should handle notEq on a queried object.', async () => {
        const request = dataStoreFilterRequest((state: ExampleDataStore) => state.cars, {
            filter: {
                predicates: [{ query: (maker: ExampleDataStore['cars'][number]) => maker.makerName, notEq: 'Maker b' }],
                op: 'AND',
            },
        });
        await expect((await doDataStoreFilter(request.payload, context)).payload.result).toEqual([
            {
                makerName: 'Maker A',
                models: [
                    { modelName: 'Model A', years: [2010, 2011] },
                    { modelName: 'Model A-1', years: [2006, 2007, 2008] },
                ],
            },
            {
                makerName: 'Maker C',
                models: [
                    { modelName: 'Fast C', years: [2005, 2006] },
                    { modelName: 'Slow C', years: [2005, 2006] },
                ],
            },
        ]);
    });
});
