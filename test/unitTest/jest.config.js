const path = require('path');
const defaultBabelConfig = require('./babel.test.config.js');

// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

const babelConfig = {
    ...defaultBabelConfig,
    sourceMaps: true,
};

module.exports = {
    // The root directory that Jest should scan for tests and modules within
    rootDir: path.join(__dirname, '../..'),

    // A list of paths to directories that Jest should use to search for files in
    roots: ['src'],

    // The glob patterns Jest uses to detect test files
    testMatch: ['**/*.spec.{tsx,jsx,ts,js}'],

    // A map from regular expressions to paths to transformers
    transform: {
        '\\.(ts|js)x?$': [require.resolve('babel-jest'), babelConfig],
    },

    clearMocks: true,

    // A list of paths to modules that run some code to configure or set up the testing framework before each test
    setupFilesAfterEnv: ['<rootDir>/test/unitTest/jest.setup.js'],

    // This option allows use of a custom test runner
    testRunner: 'jest-circus/runner',

    moduleNameMapper: {
        'cg-webworker/core': '<rootDir>/src/core',
        'cg-webworker/datastore': '<rootDir>/src/datastore',
        'cg-webworker/react': '<rootDir>/src/react',
    },
};
