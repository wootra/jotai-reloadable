/// <reference types="vitest" />
// import { defineConfig } from 'vite';
import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
global.IS_REACT_ACT_ENVIRONMENT = true;
export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'happy-dom',
    },
});
