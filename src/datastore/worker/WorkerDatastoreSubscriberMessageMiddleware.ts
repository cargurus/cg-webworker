import { BaseContext } from 'cg-webworker/core';
import { BaseRootState } from '../messaging/BaseRootState';
import { DataStoreSubscriberActions } from '../messaging/datastore.subscriptionMessages';
import { DatastoreContext } from './DatastoreContext';
import { Changes } from '../messaging/Changes';

export type WorkerDatastoreSubscriberMessageMiddleware<
    TRootState extends BaseRootState,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TContext extends DatastoreContext<TRootState> & BaseContext<any>
> = (
    changes: Changes,
    context: TContext,
    next: (changes: Changes) => Promise<DataStoreSubscriberActions>
) => Promise<DataStoreSubscriberActions>;
