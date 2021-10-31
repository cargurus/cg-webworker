const path = require('path');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const { setup: setupPuppeteer } = require('jest-environment-puppeteer');

//PUPPETEER_DOWNLOAD_PATH=~/.npm/chromium

const webpackConfig = require('./webpack.serve-test-pages.config');

function makeServer(webpackConfig, devServerConfig) {
    return new Promise((resolve, reject) => {
        if (!process.env.HOST_NAME) {
            process.env.HOST_NAME = 'localhost';
        }
        if (!process.env.HOST_PORT) {
            process.env.HOST_PORT = 9090;
        }
        const host = process.env.HOST_NAME;
        const port = process.env.HOST_PORT;

        const compiler = webpack(webpackConfig);

        let compiled = false;
        let listening = false;

        compiler.hooks.done.tap('WebpackDevServer-Waiter', () => {
            if (listening) resolve(server);
            else compiled = true;
        });

        // TODO: Tap failed hook

        const server = new WebpackDevServer(compiler, devServerConfig);

        server.listen(port, host, (err) => {
            if (err) return reject(err);

            // eslint-disable-next-line no-console
            console.log(`WebpackDevServer listening at ${host}:${port}`);

            if (compiled) resolve(server);
            else listening = true;
        });
    }).then((server) => {
        // eslint-disable-next-line no-console
        console.log('WebpackDevServer ready with compilation.');
        return server;
    });
}

// eslint-disable-next-line es/no-async-functions
module.exports = async (globalConfig) => {
    const devServerConfig = {
        publicPath: '/',
        hot: false,
        // watch: true,
        inline: true,
        contentBase: path.resolve(__dirname, '../content'),
        stats: { colors: true },
    };

    global.devServer = await makeServer(webpackConfig, devServerConfig);

    await setupPuppeteer(globalConfig);
};
