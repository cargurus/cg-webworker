const path = require('path');
const baseConfigMerge = require('./webpack.base.config.js');

module.exports = baseConfigMerge({
    entry: {
        fail_before_setup: [
            'regenerator-runtime/runtime',
            path.resolve(__dirname, '../mockSrc/entries/fail_before_setup-entry.ts'),
        ],
    },
});
