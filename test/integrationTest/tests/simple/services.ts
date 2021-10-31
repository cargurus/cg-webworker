import { ActionTypes, simpleLogRequest, simpleLogResponse } from './messages';

export const doLog = async (request: ReturnType<typeof simpleLogRequest>['payload']) => {
    // eslint-disable-next-line no-console
    console.log('doLog: ' + request.message);
    return simpleLogResponse('Received: ' + request.message);
};

export const SimpleServiceRegistry = {
    [ActionTypes.LOG]: doLog,
} as const;
