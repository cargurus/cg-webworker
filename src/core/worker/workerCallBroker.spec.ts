import { configWorkerAction } from '../messaging/configWorkerAction';
import { source } from '../messaging/source';
import { BaseContext } from './BaseContext';
import { WebWorker } from './WebWorker';
import { setupCallBroker } from './workerCallBroker';

describe('workerCallBroker', function () {
    let mockWorkerGlobalScope: WebWorker<any>;

    beforeEach(() => {
        mockWorkerGlobalScope = {
            ...window, // jsdom sets up window automatically, which gets us most of the way there for our purposes
            onmessage: jest.fn(),
            postMessage: jest.fn(),
            location: 'http://cg-webworker/' as unknown as Location,
            terminate: jest.fn(),
        } as WebWorker<any>;
    });

    afterEach(() => {
        jest.resetModules();
    });

    describe('initialization', () => {
        it('should queue message before initialized', () => {});
        it('should dequeue messages after initialized', () => {});

        it('should not send any messages during initialization', () => {});

        it('should be ready after initialization', (done) => {
            const serviceRegistryImport = jest.fn().mockImplementation(() => ({}));
            const setupContext = jest.fn().mockImplementation((worker, workerState) => ({
                worker: worker,
                logToConsole: false,
                workerState: workerState,
            }));
            const setupDependencies = jest.fn().mockImplementation((depencyPayload, onSuccess, onError) => {
                onSuccess();
            });
            const codeImport = jest.fn().mockImplementation(() =>
                Promise.resolve({
                    serviceRegistry: serviceRegistryImport,
                    middlewares: [],
                    onError: (ex: Error) => {
                        // eslint-disable-next-line no-console
                        console.error(ex);
                    },
                })
            );
            const context = setupCallBroker(mockWorkerGlobalScope, setupContext, codeImport, setupDependencies);
            mockWorkerGlobalScope.onmessage!({
                type: 'message',
                data: {
                    requestId: '12341234',
                    source: source,
                    message: configWorkerAction('http://cg/', {
                        urls: {},
                        messages: {},
                        devVars: {},
                        envVars: {},
                    }),
                },
            } as unknown as MessageEvent);
            expect(setupDependencies).toHaveBeenCalled();
            setTimeout(() => {
                expect(context.workerState.ready).toEqual(true);
                done();
            });
        });
    });
});
