const path = require('path');

module.exports = require('./webpack.base.config.js')({
    entry: {
        fail_during_service_registry_import: [
            'regenerator-runtime/runtime',
            path.resolve(__dirname, '../mockSrc/entries/fail_during_service_registry_import-entry.ts'),
        ],
    },
});
