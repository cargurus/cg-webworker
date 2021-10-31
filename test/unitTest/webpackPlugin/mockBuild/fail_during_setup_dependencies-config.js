const path = require('path');

module.exports = require('./webpack.base.config.js')({
    entry: {
        fail_during_setup_dependencies: [
            'regenerator-runtime/runtime',
            path.resolve(__dirname, '../mockSrc/entries/fail_during_setup_dependencies-entry.ts'),
        ],
    },
});
