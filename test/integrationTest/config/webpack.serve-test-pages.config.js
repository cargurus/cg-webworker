const { DefinePlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = {
    context: path.resolve(__dirname, '../'),
    entry: {
        simple: './tests/simple/app.ts',
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: '[name].js',
    },
    mode: 'production',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.(ts|js)x?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        babelrc: false,
                        configFile: path.resolve(__dirname, './babel.website.config.js'),
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
                            //inline: 'no-fallback',
                            // fallback: false,
                            filename: '[name].worker.js',
                            esModule: false,
                            // publicPath: '/Cars/dealerdashboard/bundleHack/',
                        },
                    },
                    {
                        loader: 'babel-loader',
                        options: {
                            babelrc: false,
                            configFile: path.resolve(__dirname, './babel.website.config.js'),
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new DefinePlugin({
            'process.env.LEGACY': JSON.stringify(process.env.LEGACY || false),
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        new HtmlWebpackPlugin({
            // Also generate a test.html
            filename: 'simple.html',
            template: './tests/simple/app.html',
            minify: false,
        }),
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.less', '.css'],
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                parallel: true,
            }),
        ],
        providedExports: true,
        usedExports: true,
        sideEffects: true,
    },
};
