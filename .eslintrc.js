const restrictedGlobals = require('eslint-restricted-globals');

module.exports = {
    "root": true,
    "extends": [
        "plugin:import/typescript",
        'plugin:es/no-new-in-es2018',
        'plugin:es/no-new-in-es2017',
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module",
        "ecmaFeatures": {
            "jsx": false,
        },
        // "project": "./tsconfig.json",  // Seems to do type checking as well. Possibly beneficial with caching?
    },
    "plugins": [
        'es',
        'import',
        "@typescript-eslint",
        "prettier",
        "react-hooks"
    ],
    "settings": {
        "import/resolver": {
            "typescript": {
                "extensions": [
                    ".js",
                    ".jsx",
                    ".ts",
                    ".tsx"
                ]
            }
        },
        "import/extensions": [
            ".js",
            ".jsx",
            ".ts",
            ".tsx"
        ]
    },

    "env": {
        es6: true
    },
    "rules": {
        "class-methods-use-this": 0,
        strict: 'error',

        'import/no-commonjs': 'error',
        'import/no-amd': 'error',

        // ES2019 disallow
        'es/no-json-superset': 'error',
        'es/no-optional-catch-binding': 'error',
        // ES2018 disallow not babel supported
        'es/no-regexp-lookbehind-assertions': 'error',
        'es/no-regexp-unicode-property-escapes': 'error',
        'es/no-malformed-template-literals': 'error',
        'es/no-async-iteration': 'error',
        'es/no-regexp-named-capture-groups': 'error',
        'es/no-rest-spread-properties': 'off',
        // ES2017 disallow not babel supported
        'es/no-regexp-s-flag': 'error',
        'es/no-shared-array-buffer': 'error',
        'es/no-object-getownpropertydescriptors': 'error',
        'es/no-async-functions': 'error',   // Avoid generators in babel compiled code
        'es/no-object-entries': 'off',
        'es/no-object-values': 'off',
        'es/no-trailing-function-commas': 'off',

        // Infra rules
        "no-restricted-globals": ['error'].concat(restrictedGlobals.filter(g => !["self", "importScripts"].includes(g))),
        'no-restricted-syntax': [
            // Re-declare this rule from the base config, as we allow use of for..of (generators are ok by us)
            'error',
            {
                selector: 'ForInStatement',
                message: 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
            },
            {
                selector: 'LabeledStatement',
                message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
            },
            {
                selector: 'WithStatement',
                message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
            }
        ],
        "import/extensions": "off",
        "import/no-namespace": "off",
        "import/no-extraneous-dependencies": ["error", { "peerDependencies": true }],
        "import/no-cycle": "off",   // Disabled to allow typing references for Omit etc.

        "react-hooks/exhaustive-deps": ["error", { additionalHooks: "(useUpdateEffect|useUpdateLayoutEffect)" }],
        "react-hooks/rules-of-hooks": "error",

        // QA rules
        "prefer-promise-reject-errors": ["error", { allowEmptyReject: false }],
        "no-throw-literal": "error",
        "@typescript-eslint/no-explicit-any": "error",

        // Opinionated rules
        "@typescript-eslint/explicit-function-return-type": "off",
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/no-unused-vars": "error",

        "object-shorthand": "off",
        "no-console": "error",
        "no-underscore-dangle": "off",
        "no-else-return": "off",
        "no-useless-return": "off",

        "@typescript-eslint/ban-types": "off", // TODO: Temporarily disable while get a hand on the query registry typings etc.
    },
    "overrides": [
        {
            files: "**/.eslintrc.js",
            rules: {
                "import/no-commonjs": "off",
                "@typescript-eslint/no-var-requires": "off",
            }
        },
        {
            files: "*.spec.*",
            env: {
                node: true,
                jest: true,
            },
            rules: {
                'es/no-async-functions': 'off',
                "@typescript-eslint/no-var-requires": "off",
                "@typescript-eslint/no-unused-vars": "off",
                "no-empty": 'error',
                "func-names": "off",
                'global-require': 'off',
                '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/no-non-null-assertion': 'off',
            }
        },
        {
            files: ["test/**/*.js", "build/**", 'example/build/**'],
            env: {
                node: true,
            },
            rules: {
                "import/no-commonjs": "off",
                "@typescript-eslint/no-var-requires": "off",
            },
        },
        {
            files: 'worker/**',
            env: {
                browser: false,
                worker: true,
            }
        },
        {
            files: 'client/**',
            env: {
                browser: true,
                worker: false,
            }
        },
        {
            files: 'example/**',
            rules: {
                'es/no-async-functions': 'off',
            }
        },
        {
            files: ['*.tsx', '*.jsx'],
            env: {
                browser: true,
                worker: false,
            },
            parserOptions: {
              ecmaFeatures: {
                jsx: true
              }
            },
            plugins: [
              'react',
            ],
        }
    ]
};
