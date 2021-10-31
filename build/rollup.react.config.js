import path from 'path';
import ts from 'rollup-plugin-ts';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const coreSrcDir = path.resolve(__dirname, '../src/core');
const datastoreSrcDir = path.resolve(__dirname, '../src/datastore');

export default {
    input: 'src/react/index.ts',
    output: [
        {
            file: path.resolve(__dirname, '../dist/react.cjs.js'),
            format: 'cjs',
            exports: 'named',
            sourcemap: false,
        },
        {
            file: path.resolve(__dirname, '../dist/react.js'),
            format: 'es',
            exports: 'named',
            sourcemap: false,
        },
    ],
    external: [coreSrcDir, datastoreSrcDir, 'cg-webworker/core', 'cg-webworker/datastore', 'react', 'react-dom', 'uuid'],
    treeshake: true,
    plugins: [
        alias({
            entries: [
                { find: /(..\/)*\.\.\/core/, replacement: 'cg-webworker/core' },
                { find: /(..\/)*\.\.\/datastore/, replacement: 'cg-webworker/datastore' },
            ],
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            'process.env.LEGACY': JSON.stringify(false),
            'preventAssignment': true,
        }),
        resolve(),
        ts({
            tsconfig: path.resolve(__dirname, '../src/react/tsconfig.json'),
            browserslist: false,
            transpiler: 'babel',
            cwd: path.resolve(__dirname, '../'),
            babelConfig: path.resolve(__dirname, 'babel.modern.config.js'),
        }),
        IS_PRODUCTION ? terser() : null,
    ].filter(Boolean),
};
