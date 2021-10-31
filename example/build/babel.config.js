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
                    edge: '85',
                    chrome: '85',
                    android: '85',
                    samsung: '8',
                    ios: '12',
                    safari: '12',
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
