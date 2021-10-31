const path = require('path');
const { Worker } = require('worker_threads');

function runWorker(workerBundlePath, cb, data = null) {
    let completed = false;

    const worker = new Worker(workerBundlePath, { workerData: data });
    worker.on('message', (message) => {
        if (completed) {
            return;
        }
        completed = true;
        cb(message);
    });
    worker.on('error', (err) => {
        if (completed) {
            return;
        }
        completed = true;
        cb(err);
    });
    worker.on('exit', (exitCode) => {
        if (completed) {
            return;
        }
        completed = true;
        if (exitCode === 0) {
            cb();
            return;
        }
        cb(new Error(`Worker has stopped with code ${exitCode}`));
    });
    return worker;
}

module.exports = function runWorkerTest(workerPath, origin, configDataPayload, useLegacy) {
    return new Promise(function (resolve, reject) {
        runWorker(
            path.resolve(__dirname, './TestThread.js'),
            function (result) {
                if (result instanceof Error) {
                    reject(result);
                    return;
                }
                if (result && result.type) {
                    switch (result.type) {
                        case 'ERROR_DURING_SELF_SETUP':
                        case 'ERROR_DURING_INIT':
                        case 'ERROR_DURING_IMPORT': {
                            const errorResult = new Error(result.error.name);
                            errorResult.name = result.error.name;
                            errorResult.message = result.error.message;
                            errorResult.stack = result.error.stack;
                            errorResult.fileName = result.error.fileName;
                            errorResult.lineNumber = result.error.lineNumber;
                            errorResult.columnNumber = result.error.columnNumber;
                            reject(errorResult);
                            return;
                        }
                        case 'SUCCESS':
                        default:
                            break;
                    }
                }
                resolve();
            },
            { filepath: workerPath, origin, configDataPayload, useLegacy }
        );
    });
};
