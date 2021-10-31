import { AllRequestsOf } from '../messaging/AllRequestsOf';
import { QueryRegistry } from '../messaging/QueryRegistry';

export interface Work<TQueryRegistry extends QueryRegistry<{}>> {
    requestId: string;
    message: AllRequestsOf<TQueryRegistry>;
}
