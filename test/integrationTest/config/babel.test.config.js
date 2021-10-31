module.exports = {
    babelrc: false,
    babelrcRoots: false,
    configFile: false,
    rootMode: 'root',
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
        // Style
        '@babel/plugin-proposal-object-rest-spread',
    ],
};
