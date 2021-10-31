import { createWorkerMessage, SendableObj } from './createWorkerMessage';

export enum ConfigWorkerActionKeys {
    INIT = 'INIT',
    COMPATIBILITY = 'COMPAT',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const configWorkerAction = <TData extends { [key: string]: SendableObj<any> }>(origin: string, data: TData) => {
    return createWorkerMessage({
        type: ConfigWorkerActionKeys.INIT,
        payload: {
            origin,
            data: data as SendableObj<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
        },
    });
};
