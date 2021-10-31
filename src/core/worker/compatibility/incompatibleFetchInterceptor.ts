import {
    IncompatibleFetchRequest,
    IncompatibleFetchResult,
} from '../../messaging/compatibility/IncompatibleFetchResult';
import { generateRequestId } from '../../messaging/generateRequestId';
import { BaseContext } from '../BaseContext';

export const incompatibleFetchInterceptor =
    (
        realFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ctx: BaseContext<any>
    ) =>
    (input: RequestInfo, init?: RequestInit): Promise<Response> => {
        const fetchRequestIsIncompatible =
            !realFetch ||
            (typeof input === 'string' && init && init.method === 'POST') ||
            (typeof input === 'object' && input.method === 'POST');
        if (!fetchRequestIsIncompatible) {
            if (init) return realFetch(input, init);
            else return realFetch(input);
        }

        return new Promise<Response>((resolve, reject) => {
            const requestId = generateRequestId();

            const fetchResultListener = (ev: MessageEvent) => {
                const responseData = ev.data as IncompatibleFetchResult;
                if (requestId !== responseData.requestId) {
                    return;
                }
                ev.preventDefault();
                ctx.worker.removeEventListener('message', fetchResultListener, false);

                if (responseData.payload.response) {
                    const result = new Response(responseData.payload.response.body, {
                        status: responseData.payload.response.status,
                        statusText: responseData.payload.response.statusText,
                        headers: responseData.payload.response.headers,
                    });
                    resolve(result);
                    return;
                }
                if (responseData.payload.error) {
                    const { errorName, errorMessage, errorStack } = responseData.payload.error;
                    const rebuiltError = new Error(errorMessage);
                    rebuiltError.stack = errorStack;
                    rebuiltError.name = errorName;
                    reject(rebuiltError);
                    return;
                }

                reject(new Error('No response received.'));
            };
            ctx.worker.addEventListener('message', fetchResultListener, false);

            if (input instanceof Request) {
                throw new Error('Not implemented yet');
            }

            let requestHeaders: undefined | { [key: string]: string };
            if (init && init.headers) {
                if (Array.isArray(init.headers)) {
                    requestHeaders = {};
                    init.headers.forEach(([k, v]) => {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        requestHeaders![k] = v;
                    });
                } else if (init.headers instanceof Headers) {
                    init.headers.forEach((value: string, key: string) => {
                        requestHeaders = {};
                        requestHeaders[key] = value;
                    });
                } else {
                    requestHeaders = init.headers;
                }
            }
            const fetchRequest: IncompatibleFetchRequest = {
                requestId,
                type: '__FETCHINCOMPAT',
                payload: {
                    input: input as string,
                    init: init
                        ? {
                              method: init.method,
                              headers: requestHeaders,
                              body: init.body,
                              mode: init.mode,
                              credentials: init.credentials,
                              cache: init.cache,
                              redirect: init.redirect,
                          }
                        : undefined,
                },
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ctx.worker.postMessage(fetchRequest as any);
        });
    };

let alreadySetup = false;
/**
 * setupFetchInterceptor should be called after custom initialization is done, to allow for including the fetch polyfill when desired
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setupFetchInterceptor = (ctx: BaseContext<any>) => {
    if (alreadySetup) {
        return;
    }

    if (!global.fetch) {
        if (ctx.worker.onerror) {
            ctx.worker.onerror(
                new ErrorEvent('Fetch not setup yet.', {
                    error: new Error('Fetch not setup yet.'),
                    filename: 'incompatibleFetchInterceptor.ts',
                    message: 'Fetch not setup yet.',
                })
            );
        }
        return;
    }

    const realFetch = global.fetch;
    global.fetch = incompatibleFetchInterceptor(realFetch, ctx);
    alreadySetup = true;
};
