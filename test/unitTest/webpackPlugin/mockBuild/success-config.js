const path = require('path');

module.exports = require('./webpack.base.config.js')({
    entry: { success: ['regenerator-runtime/runtime', path.resolve(__dirname, '../mockSrc/entries/success-entry.ts')] },
});
