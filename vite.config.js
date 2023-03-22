import { defineConfig } from 'vite';
import typescript from '@rollup/plugin-typescript';
import path from 'path';
import { typescriptPaths } from 'rollup-plugin-typescript-paths';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

console.log('===>', new URL('src/simple/index.ts', import.meta.url).pathname);
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [],
    build: {
        minify: false,
        lib: {
            entry: [
                new URL('src/index.ts', import.meta.url).pathname,
                new URL('src/reloadable.ts', import.meta.url).pathname,
                new URL('src/simple.ts', import.meta.url).pathname,
                new URL('src/cancelable.ts', import.meta.url).pathname,
            ],
            fileName: 'index',
            formats: ['es', 'cjs'],
        },
        rollupOptions: {
            external: [
                {
                    jotai: '/sample/v2/node_modules/jotai/esm/index.mjs',
                    'jotai/vanilla/utils/loadable':
                        '/sample/v2/node_modules/jotai/esm/vanilla/utils.mjs',
                },
            ],
            output: {
                preserveModules: true,
                // preserveModulesRoot: 'dist',
                // preserveModulesRoot: 'src',

                dir: 'dist',
                // format: 'es',
                sourcemap: false,
                exports: 'auto',
            },
            plugins: [
                typescriptPaths({
                    preserveExtensions: true,
                }),
                typescript({
                    sourceMap: false,
                    declaration: true,
                    outDir: 'dist',
                }),
                peerDepsExternal(),
            ],
        },
    },
});
