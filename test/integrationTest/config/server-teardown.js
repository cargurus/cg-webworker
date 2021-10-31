const { teardown: teardownPuppeteer } = require('jest-environment-puppeteer');

// eslint-disable-next-line es/no-async-functions
module.exports = async (globalConfig) => {
    if (global.devServer) {
        await new Promise((resolve, reject) => {
            global.devServer.close((err) => {
                if (err) {
                    // eslint-disable-next-line no-console
                    console.error(err);
                    reject(err);
                    return;
                }
                // eslint-disable-next-line no-console
                console.log('WebpackDevServer closed.');
                resolve();
            });
        });
    }
    await teardownPuppeteer(globalConfig);
};
