const { parentPort, workerData } = require('worker_threads');

const { filepath, sourcemapPath, origin, configDataPayload, useLegacy } = workerData;

let resolveReceivedExpected = null;
const receivedExpected = new Promise((resolve) => {
    resolveReceivedExpected = resolve;
});

const expectedActionType = 'WORKER_TEST_KABLAMO';

const errorsReceived = [];
const onPostMessage = (workerMessage) => {
    if (workerMessage.type === 'COMPAT') {
        // ignore compat messages
        return;
    }

    // eslint-disable-next-line no-unused-vars
    const { message } = workerMessage;

    if (!message) {
        // eslint-disable-next-line no-console
        console.warn('Unexpected non-worker message received', JSON.stringify(workerMessage));
        return;
    }

    const { type, payload } = message;

    switch (type) {
        case 'COMPAT':
            // ignore compat messages
            break;
        case 'WORKER/ERROR':
        case 'WORKER/ERROR/UNKNOWN_PACKET':
        case 'WORKER/ERROR_DURING_INIT':
            errorsReceived.push(payload.error);
            break;
        case 'WORKER/UNKNOWN_ACTION':
            if (payload.type === expectedActionType) {
                resolveReceivedExpected();
            } else {
                errorsReceived.push(payload.error);
            }
            break;
        default:
            break;
    }
};

let nextRequestId = 1;

try {
    // eslint-disable-next-line no-global-assign,no-multi-assign
    self = global.self = Object.assign({}, global);
    self.onmessage = function (ev) {
        // eslint-disable-next-line no-console
        console.warn('Message received at unexpected timing; pre-assignment handler hit.', ev);
    };
    self.postMessage = onPostMessage;
    self.location = {
        origin: origin,
    };
    // eslint-disable-next-line no-global-assign,no-multi-assign
    self.importScripts = global.importScripts = function () {};
} catch (ex) {
    parentPort.postMessage({
        type: 'ERROR_DURING_SELF_SETUP',
        error: {
            name: ex.name,
            message: ex.message,
            stack: ex.stack,
            fileName: ex.fileName,
            lineNumber: ex.lineNumber,
            columnNumber: ex.columnNumber,
        },
    });

    setTimeout(() => {
        process.exit(1);
    });
    return;
}

try {
    // eslint-disable-next-line global-require,import/no-dynamic-require
    require(filepath);
} catch (ex) {
    if (sourcemapPath) {
        // TODO: Sourcemap parse
    }

    parentPort.postMessage({
        type: 'ERROR_DURING_IMPORT',
        error: {
            name: ex.name,
            message: ex.message,
            stack: ex.stack,
            fileName: ex.fileName,
            lineNumber: ex.lineNumber,
            columnNumber: ex.columnNumber,
        },
    });
    setTimeout(() => {
        process.exit(1);
    });
    return;
}

/*
 * Our means of testing Worker setup is to:
 * 1. Import the worker entry file, where it sets up the worker's callbroker
 * 2. (If Legacy support) Send compat message, which will be processed immediately.
 * 3. Send Initialization message, which will be processed immediately.
 *      This is the bulk of the test work, as it sets up dependencies, and imports the service registry/domain code.
 *      Failures in client code will occur here.
 * 4. Send a message with an unknown action type. This will not be processed until the initialization work completes.
 * 5. If we get back an unknown action error for the expected type, we know that initialization has succeeded.
 */
try {
    if (useLegacy) {
        self.onmessage({
            data: {
                source: 'cg-webworker',
                requestId: nextRequestId++,
                message: {
                    type: 'COMPAT',
                    payload: {
                        map: new Map(),
                    },
                },
            },
        });
    }

    self.onmessage({
        data: {
            source: 'cg-webworker',
            requestId: nextRequestId++,
            message: {
                type: 'INIT',
                payload: {
                    origin: origin,
                    data: configDataPayload,
                },
            },
        },
    });

    // TODO: Total timeout from params (callCount)
    let callCount = 0;
    const timerId = setInterval(() => {
        // eslint-disable-next-line no-plusplus
        callCount++;
        if (callCount > 50) {
            // Timed out waiting for the expected action to come through
            clearInterval(timerId);

            parentPort.postMessage({
                type: 'ERROR_DURING_INIT',
                error: {
                    name: 'timed out',
                    message: '',
                },
            });
            setTimeout(() => {
                // Wait for threads to cleanup, then exit with error
                process.exit(1);
            }, 1000);
        }

        if (errorsReceived.length > 0) {
            clearInterval(timerId);
            errorsReceived.forEach((err) => {
                parentPort.postMessage({
                    type: 'ERROR_DURING_INIT',
                    error: {
                        name: err.errorName,
                        message: err.errorMessage,
                        stack: err.errorStack,
                        fileName: err.fileName,
                        lineNumber: err.lineNumber,
                        columnNumber: err.columnNumber,
                    },
                });
            });
            setTimeout(() => {
                // Wait for threads to cleanup, then exit with error
                process.exit(1);
            }, 1000);
            return;
        }
    }, 100);

    self.onmessage({
        data: {
            requestId: nextRequestId++,
            source: 'cg-webworker',
            message: {
                type: expectedActionType,
                payload: {},
            },
        },
    });

    receivedExpected.then(() => {
        // Worker initialization worked!
        clearInterval(timerId);
        setTimeout(() => {
            // Wait for threads to cleanup, then exit with success
            process.exit(0);
        }, 1000);
        return;
    });
} catch (ex) {
    if (sourcemapPath) {
        // TODO: Sourcemap parse
    }

    parentPort.postMessage({
        type: 'ERROR_DURING_INIT',
        error: {
            name: ex.name,
            message: ex.message,
            stack: ex.stack,
            fileName: ex.fileName,
            lineNumber: ex.lineNumber,
            columnNumber: ex.columnNumber,
        },
    });
    setTimeout(() => {
        process.exit(1);
    }, 1000);
}
