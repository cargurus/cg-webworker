import { BaseRootState, DataStoreQueryRequestActions } from '../messaging';
import { SubscriberResponseMessage } from '../messaging/SubscriberResponseMessage';

interface SubscribableWorkerPostMessage extends MessageEvent {
    data: DataStoreQueryRequestActions;
}

export interface SubscribableWebWorker<TRootState extends BaseRootState>
    extends Omit<Worker, 'onmessage' | 'postMessage' | 'addEventListener' | 'removeEventListener'> {
    onmessage: ((this: SubscribableWebWorker<TRootState>, ev: SubscribableWorkerPostMessage) => void) | null;
    postMessage(message: SubscriberResponseMessage, transfer: Transferable[]): void;
    postMessage(message: SubscriberResponseMessage, options?: PostMessageOptions): void;
    terminate(): void;
    addEventListener<K extends keyof WorkerEventMap>(
        type: K,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        listener: (this: SubscribableWebWorker<TRootState>, ev: WorkerEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions
    ): void;
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
    ): void;
    removeEventListener<K extends keyof WorkerEventMap>(
        type: K,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        listener: (this: SubscribableWebWorker<TRootState>, ev: WorkerEventMap[K]) => any,
        options?: boolean | EventListenerOptions
    ): void;
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions
    ): void;
}
