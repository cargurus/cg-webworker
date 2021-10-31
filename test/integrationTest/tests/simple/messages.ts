import { configWorkerAction, createWorkerMessage } from '../../../../src/core';

export const ActionTypes = {
    LOG: 'action/log',
} as const;

export const simpleLogRequest = (message: string) =>
    createWorkerMessage({ type: ActionTypes.LOG, payload: { message } });
export const simpleLogResponse = (responseText: string) =>
    createWorkerMessage({ type: ActionTypes.LOG, payload: { responseText } });

export const simpleConfigAction = (origin: string, data: { messages: Record<string, string> }) =>
    configWorkerAction(origin, data);
