const path = require('path');

module.exports = require('./webpack.base.config.js')({
    entry: {
        pass_when_violation_is_treeshaken: [
            'regenerator-runtime/runtime',
            path.resolve(__dirname, '../mockSrc/entries/pass_when_violation_is_treeshaken-entry.ts'),
        ],
    },
    mode: 'production',
    devtool: 'source-map',
});
