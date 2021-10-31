import type { AllResponsesOf } from './AllResponsesOf';
import type { AllRequestsOf } from './AllRequestsOf';
import type { QueryRegistry } from './QueryRegistry';
import type { errorAction, errorDuringWorkerInitResponse } from './errorAction';
import type { unknownActionType, unknownPacket } from './unknownActionType';
import { checkCompatibilityResponse } from './compatibility/checkCompatibilityMessages';

export interface IBrokeredRequest<TQueryRegistry extends QueryRegistry<{}>> {
    readonly requestId: string;
    readonly message: AllRequestsOf<TQueryRegistry>;
    readonly source: string;
}

export interface IBrokeredResponse<TQueryRegistry extends QueryRegistry<{}>> {
    readonly requestId: string;
    readonly message:
        | AllResponsesOf<TQueryRegistry>
        | ReturnType<typeof checkCompatibilityResponse>
        | ReturnType<typeof unknownActionType>
        | ReturnType<typeof errorDuringWorkerInitResponse>
        | ReturnType<typeof errorAction>
        | ReturnType<typeof unknownPacket>;
    readonly source: string;
}
