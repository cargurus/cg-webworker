const path = require('path');

module.exports = require('./webpack.base.config.js')({
    entry: {
        fail_during_datastore_init: [
            'regenerator-runtime/runtime',
            path.resolve(__dirname, '../mockSrc/entries/fail_during_datastore_init-entry.ts'),
        ],
    },
});
