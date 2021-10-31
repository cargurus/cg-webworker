const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { WorkerBundleIntegrityTestPlugin } = require('../../dist/webpack');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const isEnvProduction = process.env.NODE_ENV === 'production';

const BUILD_ONLY = process.env.BUILD_ONLY;

const supportLegacyBrowsers = Boolean(process.env.LEGACY);

// Variable used for enabling profiling in Production
// passed into alias object. Uses a flag if passed into the build command
const isEnvProductionProfile = true || (isEnvProduction && process.argv.includes('--profile'));

// This is the production and development configuration.
// It is focused on developer experience, fast rebuilds, and a minimal bundle.
module.exports = {
    context: path.resolve(__dirname, '../'),
    mode: isEnvProduction ? 'production' : 'development',
    devtool: isEnvProduction || true ? 'source-map' : 'cheap-module-source-map',
    entry: [
        !BUILD_ONLY && require.resolve('webpack-dev-server/client') + '?/',
        !BUILD_ONLY && require.resolve('webpack/hot/dev-server'),
        // Finally, this is your app's code:
        './src/index.tsx',
    ].filter(Boolean),
    output: {
        path: isEnvProduction ? './dist' : undefined,
        filename: isEnvProduction ? 'static/js/[name].[contenthash:8].js' : 'static/js/bundle.js',
        chunkFilename: isEnvProduction ? 'static/js/[name].[contenthash:8].chunk.js' : 'static/js/[name].chunk.js',
        publicPath: '/',
        globalObject: 'this',
    },
    optimization: {
        minimize: false,
        providedExports: true,
        usedExports: true,
        sideEffects: true,
        minimizer: [
            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    parse: {
                        ecma: 8,
                    },
                    compress: {
                        ecma: 5,
                        warnings: false,
                        comparisons: false,
                        inline: 2,
                    },
                    mangle: {
                        safari10: true,
                    },
                    keep_classnames: isEnvProductionProfile,
                    keep_fnames: isEnvProductionProfile,
                    output: {
                        ecma: 5,
                        comments: false,
                        ascii_only: true,
                    },
                },
            }),
        ],
        splitChunks: false,
    },
    resolve: {
        extensions: ['.ts', '.js', '.tsx', '.jsx'],
        alias: {
            ...(isEnvProductionProfile && {
                'react-dom$': 'react-dom/profiling',
                'scheduler/tracing': 'scheduler/tracing-profiling',
            }),
            'cg-webworker/core': supportLegacyBrowsers
                ? path.resolve(__dirname, '../../dist/legacy/core')
                : path.resolve(__dirname, '../../dist/core'),
            'cg-webworker/datastore': supportLegacyBrowsers
                ? path.resolve(__dirname, '../../dist/legacy/datastore')
                : path.resolve(__dirname, '../../dist/datastore'),
            'cg-webworker/react': supportLegacyBrowsers
                ? path.resolve(__dirname, '../../dist/legacy/react')
                : path.resolve(__dirname, '../../dist/react'),
        },
    },
    module: {
        rules: [
            // Disable require.ensure as it's not a standard language feature.
            { parser: { requireEnsure: false } },

            {
                oneOf: [
                    {
                        test: /\.(js|mjs|jsx|ts|tsx)$/,
                        exclude: /\.worker_entry\.(ts|js)$/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                babelrc: false,
                                configFile: path.resolve(
                                    __dirname,
                                    supportLegacyBrowsers ? './babel.legacy.config.js' : './babel.config.js'
                                ),
                                cacheDirectory: true,
                                cacheCompression: false,
                            },
                        },
                    },
                    {
                        test: /\.worker_entry\.(ts|js)$/,
                        exclude: /node_modules/,
                        use: [
                            {
                                loader: 'worker-loader',
                                options: {
                                    //inline: 'no-fallback',
                                    // fallback: false,
                                    filename: '[name].worker.js',
                                    esModule: false,
                                    publicPath: '/',
                                },
                            },
                            {
                                loader: 'babel-loader',
                                options: {
                                    babelrc: false,
                                    configFile: path.resolve(
                                        __dirname,
                                        supportLegacyBrowsers ? './babel.legacy.config.js' : './babel.config.js'
                                    ),
                                    cacheDirectory: true,
                                    cacheCompression: false,
                                },
                            },
                        ],
                    },
                    {
                        test: /\.css$/,
                        use: [
                            'style-loader',
                            {
                                loader: require.resolve('css-loader'),
                                options: {
                                    importLoaders: 0,
                                    modules: {
                                        localIdentName: '[path][name]__[local]--[hash:base64:5]',
                                    },
                                    sourceMap: isEnvProduction,
                                },
                            },
                        ],
                        sideEffects: true,
                    },
                ],
            },
        ],
    },
    plugins: [
        new WorkerBundleIntegrityTestPlugin({
            filePattern: /\.worker_entry\.js$/,
            configDataPayload: {},
        }),
        // Generates an `index.html` file with the <script> injected.
        new HtmlWebpackPlugin(
            Object.assign(
                {},
                {
                    inject: true,
                    template: './public/index.html',
                },
                isEnvProduction
                    ? {
                          minify: {
                              removeComments: true,
                              collapseWhitespace: true,
                              removeRedundantAttributes: true,
                              useShortDoctype: true,
                              removeEmptyAttributes: true,
                              removeStyleLinkTypeAttributes: true,
                              keepClosingSlash: true,
                              minifyJS: true,
                              minifyCSS: true,
                              minifyURLs: true,
                          },
                      }
                    : undefined
            )
        ),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        }),
        // This is necessary to emit hot updates (currently CSS only):
        !isEnvProduction && new webpack.HotModuleReplacementPlugin(),
    ].filter(Boolean),
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        compress: true,
        port: 9000,
        hot: true,
        https: true,
        open: true,
    },
    stats: {
        children: true,
    },
};
