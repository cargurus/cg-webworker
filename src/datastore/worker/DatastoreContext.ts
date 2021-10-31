import { BaseRootState } from '../messaging/BaseRootState';
import { DataStoreSubscriberService } from './DatastoreSubscriberService';

export interface DatastoreContext<TRootState extends BaseRootState> {
    datastore: DataStoreSubscriberService<TRootState>;
}
