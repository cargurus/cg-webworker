const path = require('path');
const runWorkerTest = require('./runWorkerTest');

module.exports = class WorkerBundleIntegrityTestPlugin {
    constructor({ filePattern, origin = 'http://cg-webworker', configDataPayload = {}, useLegacy = false }) {
        this.filePattern = filePattern;
        this.origin = origin;
        this.configDataPayload = configDataPayload;
        this.useLegacy = useLegacy;
    }

    apply(compiler) {
        compiler.hooks.afterEmit.tapAsync('WorkerBundleIntegrityTestPlugin', (compilation, done) => {
            const processing = [];
            Object.entries(compilation.assets).forEach((assetEntry) => {
                const assetFilename = assetEntry[0];
                if (!assetFilename.endsWith('.js')) {
                    return;
                }

                if (assetFilename.match(this.filePattern)) {
                    const filepath = path.resolve(
                        compilation.compiler.options.output.path,
                        compilation.getPath(assetFilename)
                    );
                    processing.push(runWorkerTest(filepath, this.origin, this.configDataPayload, this.useLegacy));
                }
            });
            Promise.all(processing).then(
                () => {
                    done();
                },
                (ex) => {
                    compilation.errors.push(
                        `WorkerBundleIntegrityTestPlugin:FAILURE - worker bundle failed integrity test: ${ex.name}: ${
                            ex.message
                        }${ex.stack && `\n\t${ex.stack}`}`
                    );
                    done();
                }
            );
        });
    }
};
