import { defineConfig } from 'vite';
import typescript from '@rollup/plugin-typescript';
import path from 'path';
import { typescriptPaths } from 'rollup-plugin-typescript-paths';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [],
    build: {
        minify: true,
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            fileName: 'index',
            formats: ['es', 'cjs'],
        },
        rollupOptions: {
            external: [
                {
                    jotai: '/node_modules/jotai/esm/index.mjs',
                    'jotai/vanilla/utils/loadable':
                        '/node_modules/jotai/esm/vanilla/utils.mjs',
                },
            ],
            output: {
                preserveModules: true,
                // preserveModulesRoot: 'src',
                // dir: 'dist',
                // format: 'es',
                // sourcemap: true,
            },
            plugins: [
                typescriptPaths({
                    preserveExtensions: true,
                }),
                typescript({
                    sourceMap: true,
                    declaration: true,
                    outDir: 'dist',
                }),
            ],
        },
    },
});
