import { createWorkerMessage } from '../../../../src/core';

export const SomeServiceType = 'SomeService';
export const someServiceRequest = () => createWorkerMessage({ type: SomeServiceType, payload: {} });
export const someServiceResponse = (result: boolean) =>
    createWorkerMessage({ type: SomeServiceType, payload: { result } });

export const UsesWindowType = 'UsesWindowService';
export const usesWindowServiceRequest = () => createWorkerMessage({ type: UsesWindowType, payload: {} });
export const usesWindowServiceResponse = (urls: { [key: string]: string }) =>
    createWorkerMessage({ type: UsesWindowType, payload: { urls } });
