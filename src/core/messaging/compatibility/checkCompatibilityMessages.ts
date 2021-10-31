import { createWorkerMessage } from '../createWorkerMessage';
import { ConfigWorkerActionKeys } from '../configWorkerAction';

export const checkCompatibilityRequest = () => {
    return createWorkerMessage({
        type: ConfigWorkerActionKeys.COMPATIBILITY,
        payload: {
            map: new Map(),
        },
    });
};
export const checkCompatibilityResponse = (compatibility: { map: boolean; referer: boolean }) => {
    return createWorkerMessage({
        type: ConfigWorkerActionKeys.COMPATIBILITY,
        payload: compatibility,
    });
};
