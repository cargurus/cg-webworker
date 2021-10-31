import path from 'path';
import ts from 'rollup-plugin-ts';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export default {
    input: 'src/core/index.ts',
    output: [
        {
            file: path.resolve(__dirname, '../dist/core.cjs.js'),
            format: 'cjs',
            exports: 'named',
            sourcemap: false,
        },
        {
            file: path.resolve(__dirname, '../dist/core.js'),
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
            'process.env.LEGACY': JSON.stringify(false),
            'preventAssignment': true,
        }),
        ts({
            tsconfig: path.resolve(__dirname, '../src/core/tsconfig.json'),
            browserslist: false,
            transpiler: 'babel',
            cwd: path.resolve(__dirname, '../'),
            babelConfig: path.resolve(__dirname, 'babel.modern.config.js'),
        }),
        IS_PRODUCTION ? terser() : null,
    ].filter(Boolean),
};
