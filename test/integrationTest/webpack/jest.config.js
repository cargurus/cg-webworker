const path = require('path');

const defaultBabelTestConfig = require('./babel.tests.config');

// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

const babelConfig = {
    ...defaultBabelTestConfig(),
    sourceMaps: true,
};

module.exports = {
    // The root directory that Jest should scan for tests and modules within
    rootDir: path.join(__dirname, '../../../'),

    // A list of paths to directories that Jest should use to search for files in
    roots: ['src'],

    // The glob patterns Jest uses to detect test files
    testMatch: ['**/webpack/**/*.spec.{tsx,jsx,ts,js}'],

    // A map from regular expressions to paths to transformers
    transform: {
        '\\.(ts|js)x?$': [require.resolve('babel-jest'), babelConfig],
    },

    clearMocks: true,

    // The test environment that will be used for testing
    testEnvironment: 'node',

    // This option allows use of a custom test runner
    testRunner: 'jest-circus/runner',
};
