import path from 'path';
import ts from 'rollup-plugin-ts';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const coreSrcDir = path.resolve(__dirname, '../src/core');

function rewriteToLegacyPath(filepath, kind) {
    const filename = path.basename(filepath);
    const dirs = path.dirname(filepath);
    return path.join(...dirs, 'legacy', filename);
}

const legacyCoreConfig = {
    input: 'src/core/index.ts',
    output: [
        {
            file: path.resolve(__dirname, '../dist/legacy/core.cjs.js'),
            format: 'cjs',
            exports: 'named',
            sourcemap: false,
        },
        {
            file: path.resolve(__dirname, '../dist/legacy/core.js'),
            format: 'es',
            exports: 'named',
            sourcemap: false,
        },
    ],
    external: ['uuid'],
    treeshake: true,
    plugins: [
        resolve(),
        replace({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            'process.env.LEGACY': JSON.stringify(true),
            'preventAssignment': true,
        }),
        ts({
            tsconfig: path.resolve(__dirname, '../src/core/tsconfig.legacy.json'),
            browserslist: false,
            transpiler: 'babel',
            cwd: path.resolve(__dirname, '../'),
            babelConfig: path.resolve(__dirname, 'babel.legacy.config.js'),
        }),
        IS_PRODUCTION ? terser() : null,
    ].filter(Boolean),
};

const legacyDataStoreConfig = {
    input: 'src/datastore/index.ts',
    output: [
        {
            file: path.resolve(__dirname, '../dist/legacy/datastore.cjs.js'),
            format: 'cjs',
            exports: 'named',
            sourcemap: false,
        },
        {
            file: path.resolve(__dirname, '../dist/legacy/datastore.js'),
            format: 'es',
            exports: 'named',
            sourcemap: false,
        },
    ],
    external: [coreSrcDir, 'cg-webworker/core/legacy', 'react', 'react-dom', 'uuid'],
    treeshake: true,
    plugins: [
        alias({
            entries: [{ find: /(..\/)*\.\.\/core/, replacement: 'cg-webworker/core/legacy' }],
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            'process.env.LEGACY': JSON.stringify(true),
            'preventAssignment': true,
        }),
        resolve(),
        ts({
            tsconfig: path.resolve(__dirname, '../src/datastore/tsconfig.legacy.json'),
            browserslist: false,
            transpiler: 'babel',
            cwd: path.resolve(__dirname, '../'),
            babelConfig: path.resolve(__dirname, 'babel.legacy.config.js'),
        }),
        IS_PRODUCTION ? terser() : null,
    ].filter(Boolean),
};

const reactLegacyBundleConfig = {
    input: 'src/react/index.ts',
    output: [
        {
            file: path.resolve(__dirname, '../dist/legacy/react.cjs.js'),
            format: 'cjs',
            exports: 'named',
            sourcemap: false,
        },
        {
            file: path.resolve(__dirname, '../dist/legacy/react.js'),
            format: 'es',
            exports: 'named',
            sourcemap: false,
        },
    ],
    external: ['cg-webworker/core/legacy', 'cg-webworker/datastore/legacy', 'react', 'react-dom', 'uuid'],
    treeshake: true,
    plugins: [
        alias({
            entries: [
                { find: /(..\/)*\.\.\/core/, replacement: 'cg-webworker/core/legacy' },
                { find: /(..\/)*\.\.\/datastore/, replacement: 'cg-webworker/datastore/legacy' },
            ],
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            'process.env.LEGACY': JSON.stringify(true),
            'preventAssignment': true,
        }),
        resolve(),
        ts({
            tsconfig: path.resolve(__dirname, '../src/react/tsconfig.legacy.json'),
            browserslist: false,
            transpiler: 'babel',
            cwd: path.resolve(__dirname, '../'),
            babelConfig: path.resolve(__dirname, 'babel.legacy.config.js'),
            // hook: {
            //     outputPath: rewriteToLegacyPath,
            // },
        }),
        IS_PRODUCTION ? terser() : null,
    ].filter(Boolean),
};

export default [legacyCoreConfig, legacyDataStoreConfig, reactLegacyBundleConfig];
