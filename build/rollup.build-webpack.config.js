import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export default {
    input: 'src/webpack/index.ts',
    output: {
        file: path.resolve(__dirname, '../dist/webpack.js'),
        format: 'cjs',
        exports: 'named',
        sourcemap: false,
    },
    external: [],
    treeshake: true,
    plugins: [
        resolve(),
        replace({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            'process.env.LEGACY': JSON.stringify(false),
            'preventAssignment': true,
        }),
        commonjs(),
        getBabelOutputPlugin({
            presets: [
                [
                    '@babel/preset-env',
                    {
                        ignoreBrowserslistConfig: true,
                        modules: 'commonjs',
                        targets: {
                            node: '12',
                        },
                    },
                ],
            ],
        }),
        //babel({ babelHelpers: 'bundled' }),
        IS_PRODUCTION ? terser() : null,
    ].filter(Boolean),
};
