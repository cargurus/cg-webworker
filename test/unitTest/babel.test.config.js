const path = require('path');

module.exports = {
    babelrc: false,
    babelrcRoots: false,
    configFile: false,
    rootMode: 'root',
    extends: path.resolve(__dirname, '../../build/babel.modern.config.js'),
    ignore: ['node_modules'],
    presets: [
        [
            '@babel/preset-env',
            {
                ignoreBrowserslistConfig: true,
                modules: 'commonjs',
                targets: {
                    node: true,
                },
            },
        ],
        '@babel/preset-typescript',
    ],
    env: {
        coverage: {
            plugins: ['babel-plugin-istanbul'],
        },
    },
};
