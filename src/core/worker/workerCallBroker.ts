import { configWorkerAction, ConfigWorkerActionKeys } from '../messaging/configWorkerAction';
import { setupFetchInterceptor } from './compatibility/incompatibleFetchInterceptor';
import { errorAction, errorDuringWorkerInitResponse } from '../messaging/errorAction';
import {
    checkCompatibilityRequest,
    checkCompatibilityResponse,
} from '../messaging/compatibility/checkCompatibilityMessages';
import { createWorkProcessor } from './createWorkProcessor';
import { BaseContext } from './BaseContext';
import { QueryRegistry } from '../messaging/QueryRegistry';
import { Work } from './Work';
import { AllRequestsOf } from '../messaging/AllRequestsOf';
import { AllResponsesOf } from '../messaging/AllResponsesOf';
import { WorkerMessageMiddleware } from './WorkerMessageMiddleware';
import { unknownPacket } from '../messaging/unknownActionType';
import { source } from '../messaging/source';
import { compatDecodeValue } from '../messaging/compatibility';
import { WebWorker } from './WebWorker';

const processInitializationRequest = <
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TContext extends BaseContext<any>,
    TDependencyPayload extends ReturnType<typeof configWorkerAction>['payload']
>(
    ctx: TContext,
    request: {
        readonly requestId: string;
        readonly message: { payload: TDependencyPayload };
        readonly source: string;
    },
    setupDependencies: (
        dependencyPayload: TDependencyPayload,
        onSuccess: () => void,
        onError: (error: Error) => void
    ) => void,
    processQueue: (onServiceRegistryImportError: (ex: Error) => void) => void
) => {
    // Cannot initialize twice; throw error back to client
    if (ctx.workerState.ready) {
        ctx.worker.postMessage({
            requestId: request.requestId,
            message: errorAction(new Error('Worker is already initialized.')),
            source: source,
        });
        return;
    }

    let initConfigPayload = request.message.payload;
    if (process.env.LEGACY) {
        if (!ctx.workerState.mapCompatibility) {
            initConfigPayload = compatDecodeValue({ ...initConfigPayload }, new WeakMap());
        }
    }

    const onServiceRegistryImportError = (ex: Error) => {
        if (ctx.logToConsole) {
            try {
                // eslint-disable-next-line no-console
                console.error(`Error setting up service registry: ${ex}`, ex);
            } catch (ex) {}
        }

        ctx.worker.postMessage({
            requestId: request.requestId,
            message: errorDuringWorkerInitResponse(ex),
            source: source,
        });
    };
    const onSetupDependenciesError = (error: Error) => {
        if (ctx.logToConsole) {
            try {
                // eslint-disable-next-line no-console
                console.error(`Error setting up dependencies: ${error}`, error);
            } catch (ex) {}
        }

        // Note that we attempt to process the queue later, regardless of failure,
        // as failures during init might be partially recoverable (in the case of polyfills).
        // The init error is passed back to the client for any decision there as to how to respond to an error.
        ctx.worker.postMessage({
            requestId: request.requestId,
            message: errorDuringWorkerInitResponse(error),
            source: source,
        });

        if (process.env.LEGACY) {
            if (!ctx.workerState.refererCompatibility) {
                setupFetchInterceptor(ctx);
            }
        }
        processQueue(onServiceRegistryImportError);
    };

    try {
        setupDependencies(
            initConfigPayload,
            () => {
                if (process.env.LEGACY) {
                    if (!ctx.workerState.refererCompatibility) {
                        setupFetchInterceptor(ctx);
                    }
                }

                processQueue(onServiceRegistryImportError);
            },
            onSetupDependenciesError
        );
    } catch (ex) {
        onSetupDependenciesError(ex as Error);
    }
};

export const setupCallBroker = <
    TQueryRegistry extends QueryRegistry<{}>,
    TContext extends BaseContext<TQueryRegistry>,
    TServiceRegistry extends Record<
        string,
        (
            request: AllRequestsOf<TQueryRegistry>['payload'],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ctx: TContext
        ) => Promise<AllResponsesOf<TQueryRegistry>>
    >,
    TDependencyPayload extends ReturnType<typeof configWorkerAction>['payload']
>(
    thisWorker: WebWorker<TQueryRegistry>,
    setupContext: (worker: WebWorker<TQueryRegistry>, workerState: TContext['workerState']) => TContext,
    codeImport: () => Promise<{
        serviceRegistry: TServiceRegistry;
        middlewares?: WorkerMessageMiddleware<TQueryRegistry, TContext>[];
        onError: (ex: Error) => void;
    }>,
    setupDependencies: (
        dependencyPayload: TDependencyPayload,
        onSuccess: () => void,
        onError: (error: Error) => void
    ) => void
): TContext => {
    /*
     * IE11 and potentially others do not set the origin in web workers.
     * This means XHR and fetches will not include Referer or Origin headers,
     * and will therefore fail CSRF checks on the server.
     */
    const isCsrfCompatible =
        (thisWorker.location && thisWorker.location.origin && thisWorker.location.origin.indexOf('http') === 0) ||
        false;

    const ctx: TContext = setupContext(thisWorker, {
        ready: false,
        queue: [],
        mapCompatibility: null,
        refererCompatibility: isCsrfCompatible,
    });

    let processor: (workerCtx: TContext, work: Work<TQueryRegistry>) => Promise<void>;

    const processQueue = (onServiceRegistryImportError: (ex: Error) => void) => {
        // After initialization, set the processor.
        // We import this using dynamic eager imports instead of regular import,
        // as import hoisting would cause breakages with missing polyfills and globals,
        // due to initialization calls during module scope.
        try {
            createWorkProcessor(codeImport)
                .then(
                    (processorFunction) => {
                        processor = processorFunction;
                        if (ctx.workerState.queue && ctx.workerState.queue.length > 0) {
                            for (let i = 0; i < ctx.workerState.queue.length; i++) {
                                processor(ctx, ctx.workerState.queue[i]);
                            }
                            ctx.workerState.queue = [];
                        }
                        ctx.workerState.ready = true;
                    },
                    (ex) => {
                        // Error during setup of service registry from client
                        onServiceRegistryImportError(ex);
                    }
                )
                .catch((ex: Error) => {
                    // Error during process of work item
                    if (ctx.logToConsole) {
                        // eslint-disable-next-line no-console
                        console.error(ex.message, ex.stack);
                    }
                    return Promise.reject(ex);
                });
        } catch (ex) {
            onServiceRegistryImportError(ex as Error);
        }
    };

    ctx.worker.onmessage = (ev) => {
        if (!ev.data || typeof ev.data !== 'object') {
            return;
        }
        if (ev.data.source !== source) {
            // Ignore react devtools messages etc.
            return;
        }

        if (process.env.LEGACY) {
            if ('type' in ev.data.message && ev.data.message.type === ConfigWorkerActionKeys.COMPATIBILITY) {
                const messagePayload = ev.data.message.payload as ReturnType<
                    typeof checkCompatibilityRequest
                >['payload'];
                ctx.workerState.mapCompatibility = Boolean(messagePayload.map && messagePayload.map instanceof Map);
                ctx.worker.postMessage({
                    requestId: ev.data.requestId,
                    source: ev.data.source,
                    message: checkCompatibilityResponse({
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        map: ctx.workerState.mapCompatibility!,
                        referer: ctx.workerState.refererCompatibility,
                    }),
                });
                return;
            }
        }

        if (!ev.data.requestId || !ev.data.message) {
            ctx.worker.postMessage({
                requestId: ev.data.requestId,
                message: unknownPacket(ev.data),
                source: source,
            });
            return;
        }

        if (ev.data.message.type === ConfigWorkerActionKeys.INIT) {
            processInitializationRequest(ctx, ev.data, setupDependencies, processQueue);
            return;
        }

        if (ctx.workerState.ready) {
            // Worker is ready. Process the work immediately
            processor(ctx, ev.data);
            return;
        } else {
            ctx.workerState.queue.push(ev.data);
            return;
        }
    };

    return ctx;
};
