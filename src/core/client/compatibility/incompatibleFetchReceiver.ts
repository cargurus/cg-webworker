import { WorkerClient } from '../WorkerClient';
import {
    IncompatibleFetchRequest,
    IncompatibleFetchResult,
} from '../../messaging/compatibility/IncompatibleFetchResult';

export const setupIncompatibleFetchReceiver = (worker: WorkerClient) => {
    worker.addEventListener(
        'message',
        (ev: MessageEvent) => {
            if (ev.data && ev.data.type === '__FETCHINCOMPAT') {
                ev.preventDefault();

                try {
                    const {
                        payload: { input, init },
                    } = ev.data as IncompatibleFetchRequest;

                    let fetchRequest;
                    if (init) {
                        const parsedInit: RequestInit = {
                            cache: init.cache,
                            credentials: init.credentials,
                            method: init.method,
                            mode: init.mode,
                            redirect: init.redirect,
                            body: init.body,
                            headers: init.headers,
                        };
                        fetchRequest = fetch(input, parsedInit);
                    } else {
                        fetchRequest = fetch(input);
                    }
                    fetchRequest.then(
                        (response) => {
                            const responseHeaders: { [key: string]: string } = {};
                            if (response.headers) {
                                response.headers.forEach((value: string, key: string) => {
                                    responseHeaders[key] = value;
                                });
                            }

                            const result: IncompatibleFetchResult = {
                                requestId: ev.data.requestId,
                                type: '__FETCHINCOMPAT',
                                payload: {
                                    response: {
                                        body:
                                            response.body != null
                                                ? response.body
                                                : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                  (response as Response & { _bodyInit: any })._bodyInit,
                                        headers: responseHeaders,
                                        status: response.status,
                                        statusText: response.statusText,
                                    },
                                },
                            };
                            worker.postMessage(result);
                        },
                        (error: Error) => {
                            const result: IncompatibleFetchResult = {
                                requestId: ev.data.requestId,
                                type: '__FETCHINCOMPAT',
                                payload: {
                                    error: {
                                        errorName: (error as Error).name,
                                        errorMessage: (error as Error).message,
                                        errorStack: (error as Error).stack,
                                    },
                                },
                            };
                            worker.postMessage(result);
                        }
                    );
                } catch (ex) {
                    const result: IncompatibleFetchResult = {
                        requestId: ev.data.requestId,
                        type: '__FETCHINCOMPAT',
                        payload: {
                            error: {
                                errorName: (ex as Error).name,
                                errorMessage: (ex as Error).message,
                                errorStack: (ex as Error).stack,
                            },
                        },
                    };
                    worker.postMessage(result);
                }
            }
        },
        false
    );
};
