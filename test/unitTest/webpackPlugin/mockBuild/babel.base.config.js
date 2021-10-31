module.exports = {
    ignore: ['node_modules'],
    presets: [
        [
            '@babel/preset-env',
            {
                modules: false,
                useBuiltIns: false,
                targets: {
                    ie: '11',
                    edge: '12',
                    chrome: '43',
                    android: '4.3',
                    samsung: '4',
                    ios: '6',
                },
            },
        ],
        '@babel/preset-typescript',
    ],
    plugins: [
        // Stage 2
        '@babel/plugin-proposal-function-sent',
        '@babel/plugin-proposal-export-namespace-from',
        '@babel/plugin-proposal-numeric-separator',
        '@babel/plugin-proposal-throw-expressions',

        // Stage 3
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-syntax-import-meta',
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-json-strings',
        '@babel/plugin-proposal-optional-chaining',

        // Style
        '@babel/plugin-proposal-object-rest-spread',
    ],
};
