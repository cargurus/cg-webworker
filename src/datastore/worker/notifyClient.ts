import { BaseContext } from 'cg-webworker/core';

import { SubscribableWebWorker } from './SubscribableWebWorker';
import {
    DataStoreSubscriberActions,
    dataStoreSubscriberNotifyAction,
} from '../messaging/datastore.subscriptionMessages';
import { source } from '../messaging/source';
import { BaseRootState } from '../messaging';
import { DatastoreContext } from './DatastoreContext';
import { WorkerDatastoreSubscriberMessageMiddleware } from './WorkerDatastoreSubscriberMessageMiddleware';
import { Changes } from '../messaging/Changes';

export const notifyClient = <
    TRootState extends BaseRootState,
    TContext extends DatastoreContext<TRootState> & BaseContext<any> // eslint-disable-line @typescript-eslint/no-explicit-any
>(
    changes: Changes,
    ctx: TContext,
    subscriptionNotificationMiddlewares:
        | WorkerDatastoreSubscriberMessageMiddleware<TRootState, TContext>[]
        | null = null
): Promise<void> => {
    if (subscriptionNotificationMiddlewares) {
        let i = 0;
        const nexter = (nextChanges: Changes): Promise<DataStoreSubscriberActions> => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            if (i + 1 > subscriptionNotificationMiddlewares!.length) {
                return Promise.resolve(dataStoreSubscriberNotifyAction(changes));
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return subscriptionNotificationMiddlewares![i++](nextChanges, ctx, nexter);
        };
        return nexter(changes).then((processedResponseBody: DataStoreSubscriberActions) => {
            (ctx.worker as SubscribableWebWorker<TRootState>).postMessage({
                source: source,
                message: processedResponseBody,
            });
            return Promise.resolve();
        });
    } else {
        (ctx.worker as SubscribableWebWorker<TRootState>).postMessage({
            source: source,
            message: dataStoreSubscriberNotifyAction(changes),
        });
        return Promise.resolve();
    }
};
