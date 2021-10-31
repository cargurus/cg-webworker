module.exports = {
    plugins: ['react', 'react-hooks'],
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        // "project": "./tsconfig.json",  // Seems to do type checking as well. Possibly beneficial with caching?
    },
    rules: {
        'react-hooks/exhaustive-deps': ['error', { additionalHooks: '(useSubscribeChange)' }],
    },
};
