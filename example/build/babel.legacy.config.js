module.exports = {
    babelrc: false,
    babelrcRoots: false,
    ignore: ['node_modules'],
    presets: [
        [
            '@babel/preset-env',
            {
                ignoreBrowserslistConfig: true,
                modules: false,
                useBuiltIns: false,
                targets: {
                    ie: '11',
                    edge: '18',
                    chrome: '43',
                    android: '4.3',
                    samsung: '4',
                    ios: '6',
                },
            },
        ],
        '@babel/preset-typescript',
        '@babel/preset-react',
    ],
    plugins: [
        // Stage 2
        '@babel/plugin-proposal-function-sent',
        '@babel/plugin-proposal-export-namespace-from',
        '@babel/plugin-proposal-numeric-separator',
        '@babel/plugin-proposal-throw-expressions',

        // Stage 3
        '@babel/plugin-syntax-import-meta',
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-json-strings',
        '@babel/plugin-proposal-optional-chaining',
    ],
};
