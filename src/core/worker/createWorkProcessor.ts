import { errorAction } from '../messaging/errorAction';
import { unknownActionType } from '../messaging/unknownActionType';
import { AllRequestsOf } from '../messaging/AllRequestsOf';
import { QueryRegistry } from '../messaging/QueryRegistry';
import { BaseContext } from './BaseContext';
import { Work } from './Work';
import { WorkerMessageMiddleware } from './WorkerMessageMiddleware';
import { compatibilityMiddleware } from './compatibility/compatibilityMiddleware';
import { WorkerMessage } from '../messaging/createWorkerMessage';
import { source } from '../messaging/source';
import { ServiceRegistry } from './ServiceRegistry';

function workProcessor<
    TQueryRegistry extends QueryRegistry<{}>,
    TContext extends BaseContext<TQueryRegistry>,
    TServiceRegistry extends ServiceRegistry<TQueryRegistry, TContext>
>(
    request: AllRequestsOf<TQueryRegistry>,
    context: TContext,
    serviceRegistry: TServiceRegistry,
    onError: (ex: Error) => void
) {
    try {
        if (request.type in serviceRegistry) {
            const service = serviceRegistry[request.type as keyof typeof serviceRegistry];
            if (service) {
                // type ResponseType = ResponseOf<TQueryRegistry, typeof request.type>;
                return service(request.payload, context).catch((ex: Error) => {
                    try {
                        onError(ex);
                    } catch (innerEx) {
                        /* ignore */
                    }

                    return Promise.resolve(errorAction(ex as Error));
                });
            } else {
                throw new Error(`No service registered to process message: ${request.type}`);
            }
        } else {
            return Promise.resolve(unknownActionType(request.type));
        }
    } catch (ex) {
        try {
            onError(ex as Error);
        } catch (innerEx) {
            /* ignore */
        }

        return Promise.resolve(errorAction(ex as Error));
    }
}

export const createWorkProcessor = <
    TQueryRegistry extends QueryRegistry<{}>,
    TContext extends BaseContext<TQueryRegistry>,
    TServiceRegistry extends ServiceRegistry<TQueryRegistry, TContext>
>(
    codeImport: () => Promise<{
        serviceRegistry: TServiceRegistry;
        middlewares?: WorkerMessageMiddleware<TQueryRegistry, TContext>[];
        onError: (ex: Error) => void;
    }>
) => {
    return codeImport().then(({ serviceRegistry, middlewares, onError }) => {
        if (process.env.LEGACY) {
            // Compat middleware must run on request before the payload is used elsewhere
            middlewares = ([] as WorkerMessageMiddleware<TQueryRegistry, TContext>[]).concat(
                [compatibilityMiddleware],
                middlewares || []
            );
        }
        return (ctx: TContext, work: Work<TQueryRegistry>) => {
            const requestId = work.requestId;
            let i = 0;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const nexter = (work: Work<TQueryRegistry>): Promise<WorkerMessage<any, any>> => {
                if (!middlewares || i + 1 > middlewares.length) {
                    return workProcessor<TQueryRegistry, TContext, TServiceRegistry>(
                        work.message,
                        ctx,
                        serviceRegistry,
                        onError
                    );
                }
                return middlewares[i++](work, ctx, nexter);
            };
            return nexter(work).then((responseMessage) => {
                if (responseMessage.transferrables != null) {
                    ctx.worker.postMessage(
                        {
                            source: source,
                            requestId: requestId,
                            message: responseMessage,
                        },
                        responseMessage.transferrables as Transferable[]
                    );
                } else {
                    ctx.worker.postMessage({
                        source: source,
                        requestId: requestId,
                        message: responseMessage,
                    });
                }
            });
        };
    });
};
