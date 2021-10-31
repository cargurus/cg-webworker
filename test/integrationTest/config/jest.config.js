const path = require('path');

// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
    // The root directory that Jest should scan for tests and modules within
    rootDir: path.join(__dirname, '../..'),

    // A list of paths to directories that Jest should use to search for files in
    roots: ['integrationTest'],

    // The glob patterns Jest uses to detect test files
    testMatch: ['**/*.spec.{tsx,jsx,ts,js}'],

    // A map from regular expressions to paths to transformers
    // transform: {
    //     '\\.(ts|js)x?$': [require.resolve('babel-jest'), babelConfig],
    // },

    clearMocks: true,

    // A list of paths to modules that run some code to configure or set up the testing framework before each test
    setupFilesAfterEnv: ['<rootDir>/integrationTest/config/jest.setup.js'],

    preset: 'jest-puppeteer',

    globalSetup: path.join(__dirname, 'server-setup.js'),
    globalTeardown: path.join(__dirname, 'server-teardown.js'),
};
