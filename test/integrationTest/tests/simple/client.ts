import { clientCallBroker, workerProvider, AllRequestsOf, ResponseOf } from '../../../../src/core';

// Below linting/ts-ignore is to allow the webpack worker-loader to mash the import however it likes.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import SimpleWorkerReference from './entry.worker';

import { SimpleQueryRegistry } from './queryRegistry';

export const simpleWorkerProvider = () =>
    workerProvider(
        'simple',
        () => new SimpleWorkerReference(),
        () => {
            // Initialization

            return {
                someGlobal: [1, 2, 3, 4],
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                anotherGlobal: new Map<string, any>([
                    ['works?', 'yes'],
                    ['this too?', { you: 'believe it' }],
                ]),
            };
        }
    );

export const simpleCallBroker = <TRequestMessage extends AllRequestsOf<SimpleQueryRegistry>>(
    request: TRequestMessage
): Promise<ResponseOf<SimpleQueryRegistry, TRequestMessage['type']>['payload']> =>
    clientCallBroker<SimpleQueryRegistry, TRequestMessage>(simpleWorkerProvider(), request);
