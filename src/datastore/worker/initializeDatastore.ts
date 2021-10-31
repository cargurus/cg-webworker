import { BaseContext } from 'cg-webworker/core';
import { BaseRootState } from '../messaging/BaseRootState';
import { compatibilityMiddleware } from './compatibility/compatibilityMiddleware';
import { DatastoreContext } from './DatastoreContext';
import { DataStoreSubscriberService } from './DatastoreSubscriberService';
import { notifyClient } from './notifyClient';
import { WorkerDatastoreSubscriberMessageMiddleware } from './WorkerDatastoreSubscriberMessageMiddleware';

export const initializeDatastore = <
    TRootState extends BaseRootState,
    TContext extends DatastoreContext<TRootState> & BaseContext<any> // eslint-disable-line @typescript-eslint/no-explicit-any
>(
    getCtx: () => TContext,
    getRootState: () => TRootState,
    subscriptionNotificationMiddlewares:
        | WorkerDatastoreSubscriberMessageMiddleware<TRootState, TContext>[]
        | null = null
): DataStoreSubscriberService<TRootState> => {
    if (process.env.LEGACY) {
        subscriptionNotificationMiddlewares = (
            [] as WorkerDatastoreSubscriberMessageMiddleware<TRootState, TContext>[]
        ).concat(subscriptionNotificationMiddlewares || [], [compatibilityMiddleware]);
    }
    const subscriptionService = new DataStoreSubscriberService(getRootState, (changes) => {
        notifyClient(changes, getCtx(), subscriptionNotificationMiddlewares).catch((ex) => {
            // eslint-disable-next-line no-console
            console.error('Error during notify subscriber middleware:', ex);
        });
    });
    return subscriptionService;
};
