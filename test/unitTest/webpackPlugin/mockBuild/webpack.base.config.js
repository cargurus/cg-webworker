const { DefinePlugin } = require('webpack');
const path = require('path');
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');

const WorkerBundleIntegrityTestPlugin = require('../../../../src/webpack/WorkerBundleIntegrityTestPlugin');

const outputDir = path.resolve(__dirname, '../../../../.cache');

const webpackBaseConfig = {
    context: path.resolve(__dirname, '../'),
    mode: 'production',
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.less', '.css'],
    },
    stats: {
        logging: 'none',
    },
    output: {
        globalObject: `(typeof self !== 'undefined' ? self : window)`,
        path: outputDir,
        publicPath: '/bundles/',
        filename: `[name].js`,
        chunkFilename: `[name].chunk.js`,
    },
    plugins: [
        new WorkerBundleIntegrityTestPlugin({
            filePattern: /worker\.entry\.js$/,
            configDataPayload: {
                urls: {},
                messages: {},
                devVars: {},
                envVars: {},
            },
        }),
        new DefinePlugin({
            'process.env.LEGACY': JSON.stringify(false),
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(ts|js)x?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        babelrc: false,
                        configFile: path.resolve(__dirname, './babel.base.config.js'),
                        cacheDirectory: path.resolve(__dirname, '../../../.cache'),
                        cacheCompression: false,
                    },
                },
            },
            {
                test: /\.worker\.(ts|js)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'worker-loader',
                        options: {
                            // inline: false,
                            // fallback is False by default. Do not explicitly add this, as worker-loader will not emit if the fallback option is provided.
                            // fallback: false,
                            filename: '[name]_worker.entry.js',
                            publicPath: '/bundles/',
                        },
                    },
                    {
                        loader: 'babel-loader',
                        options: {
                            babelrc: false,
                            configFile: path.resolve(__dirname, './babel.base.config.js'),
                            cacheDirectory: path.resolve(__dirname, '../../../.cache'),
                            cacheCompression: false,
                        },
                    },
                ],
            },
        ],
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                parallel: true,
            }),
        ],
        providedExports: true,
        usedExports: true,
        sideEffects: true,
        splitChunks: {
            chunks: () => true,
            minSize: 30000,
            maxSize: 0,
            minChunks: 1,
            maxAsyncRequests: Infinity,
            maxInitialRequests: Infinity,
            cacheGroups: {
                default: false,
            },
        },
    },
};

module.exports = (config) => merge(webpackBaseConfig, config);
