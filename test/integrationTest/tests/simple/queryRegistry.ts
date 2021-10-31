import { WorkerQuery } from '../../../../src/core';
import { ActionTypes, simpleLogRequest, simpleLogResponse } from './messages';

export type SimpleQueryRegistry = {
    [ActionTypes.LOG]: WorkerQuery<typeof simpleLogRequest, typeof simpleLogResponse>;
};
