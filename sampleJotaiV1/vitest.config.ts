/// <reference types="vitest" />
// import { defineConfig } from 'vite';
import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
global.IS_REACT_ACT_ENVIRONMENT = true;
export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'happy-dom',
        hookTimeout: 10000,
        setupFiles: ['/__tests__/setupTests.ts'],
        root: './src',
        // fakeTimers: {
        //     now: 0,
        //     loopLimit: 100,
        //     shouldClearNativeTimers: true,
        //     shouldAdvanceTime: true,
        //     advanceTimeDelta: 20,
        //     toFake: [
        //         'setTimeout',
        //         'clearTimeout',
        //         'setInterval',
        //         'clearInterval',
        //     ],
        // },
    },
});
