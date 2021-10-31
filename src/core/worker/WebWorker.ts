import type { IBrokeredRequest, IBrokeredResponse } from '../messaging/IBrokeredMessage';
import type { QueryRegistry } from '../messaging/QueryRegistry';

export interface WebWorker<TQueryRegistry extends QueryRegistry<{}>>
    extends Omit<Worker, 'onmessage' | 'postMessage' | 'addEventListener' | 'removeEventListener'> {
    location: Location;
    onmessage: ((this: WebWorker<TQueryRegistry>, ev: MessageEvent<IBrokeredRequest<TQueryRegistry>>) => void) | null;
    postMessage(message: IBrokeredResponse<TQueryRegistry>, transfer: Transferable[]): void;
    postMessage(message: IBrokeredResponse<TQueryRegistry>, options?: PostMessageOptions): void;
    terminate(): void;
    addEventListener<K extends keyof WorkerEventMap>(
        type: K,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        listener: (this: WebWorker<TQueryRegistry>, ev: WorkerEventMap[K]) => any,
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
        listener: (this: WebWorker<TQueryRegistry>, ev: WorkerEventMap[K]) => any,
        options?: boolean | EventListenerOptions
    ): void;
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions
    ): void;
}
