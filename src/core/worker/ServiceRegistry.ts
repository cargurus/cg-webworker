import { AllResponsesOf } from '../messaging/AllResponsesOf';
import { AllRequestsOf } from '../messaging/AllRequestsOf';
import { QueryRegistry } from '../messaging/QueryRegistry';
import { BaseContext } from './BaseContext';

export type ServiceRegistry<
    TQueryRegistry extends QueryRegistry<{}>,
    TContext extends BaseContext<TQueryRegistry>
> = Record<
    AllRequestsOf<TQueryRegistry>['type'],
    (request: AllRequestsOf<TQueryRegistry>['payload'], ctx: TContext) => Promise<AllResponsesOf<TQueryRegistry>>
>;
