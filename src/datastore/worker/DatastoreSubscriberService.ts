import { QueryKey } from '../messaging/QueryKey';
import { cloneResult } from './utils/cloneResult';
import { executeDataStoreQuery } from './services/executeDataStoreQuery';
import { Changes } from '../messaging/Changes';

export class DataStoreSubscriberService<TRootState> {
    public readonly getRootState: () => TRootState;

    private readonly dataSubscribers: Map<string, { query: QueryKey[]; lastResult: any }>; // eslint-disable-line @typescript-eslint/no-explicit-any
    private readonly changeSubscribers: Map<string, { query: QueryKey[]; lastResult: any }>; // eslint-disable-line @typescript-eslint/no-explicit-any
    private readonly onChanges: (changes: Changes) => void;

    public constructor(getRootState: () => TRootState, onChanges: (changes: Changes) => void) {
        this.dataSubscribers = new Map<string, { query: QueryKey[]; lastResult: any }>(); // eslint-disable-line @typescript-eslint/no-explicit-any
        this.changeSubscribers = new Map<string, { query: QueryKey[]; lastResult: any }>(); // eslint-disable-line @typescript-eslint/no-explicit-any
        this.getRootState = getRootState;
        this.onChanges = onChanges;

        this.subscribeData = this.subscribeData.bind(this);
        this.unsubscribeData = this.unsubscribeData.bind(this);
        this.subscribeChanges = this.subscribeChanges.bind(this);
        this.unsubscribeChanges = this.unsubscribeChanges.bind(this);
        this.handleStoreChanges = this.handleStoreChanges.bind(this);
        this.getChanges = this.getChanges.bind(this);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public subscribeData(subscriberId: string, query: QueryKey[], firstResult: any): void {
        this.dataSubscribers.set(subscriberId, { query, lastResult: firstResult });
    }

    public unsubscribeData(subscriberId: string): void {
        this.dataSubscribers.delete(subscriberId);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public subscribeChanges(subscriberId: string, query: QueryKey[], firstResult: any): void {
        this.changeSubscribers.set(subscriberId, { query, lastResult: firstResult });
    }

    public unsubscribeChanges(subscriberId: string): void {
        this.changeSubscribers.delete(subscriberId);
    }

    public handleStoreChanges() {
        const changes = this.getChanges();
        if (changes.data.size > 0 || changes.notify.length > 0) {
            this.onChanges(changes);
        }
    }

    public getChanges(): Changes {
        const dataNotifications = new Map<string, any>(); // eslint-disable-line @typescript-eslint/no-explicit-any
        for (const [subscriberId, { query, lastResult }] of Array.from(this.dataSubscribers.entries())) {
            /* could be
             * array
             * map
             * date
             * object
             * value type
             *
             * Object results occur when: the queryObj is the target -> same value
             *   - the result looks lke:
             * Map results occur when:
             *   - the result looks lke:
             * Array results occur when:
             *   - the result looks lke:
             *
             *
             * Deep equivalency:
             * -Map
             * -- Either one of the keys doesn't exist
             * -- One of the values fails deep equal
             *
             * -Array
             * -- One of the values fails deep equal
             *
             * -Object
             * -- one of the keys doesn't exist
             * -- One of the values fails deep equal
             */
            const newResult = executeDataStoreQuery(this.getRootState, query);

            if (newResult != lastResult) {
                dataNotifications.set(subscriberId, newResult);
                this.dataSubscribers.set(subscriberId, { query, lastResult: cloneResult(newResult) });
            }
        }

        const changeNotifications = [] as string[];
        for (const [subscriberId, { query, lastResult }] of Array.from(this.changeSubscribers.entries())) {
            const newResult = executeDataStoreQuery(this.getRootState, query);

            if (newResult != lastResult) {
                changeNotifications.push(subscriberId);
                this.changeSubscribers.set(subscriberId, { query, lastResult: cloneResult(newResult) });
            }
        }
        return {
            data: dataNotifications,
            notify: changeNotifications,
        };
    }
}
