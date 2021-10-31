module.exports = () => ({
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
    ],
});
