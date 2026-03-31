import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'EkkoDS',
      formats: ['es', 'cjs', 'iife'],
      fileName: (format) => {
        if (format === 'es') return 'ekko-ds.esm.js';
        if (format === 'cjs') return 'ekko-ds.cjs.js';
        return 'ekko-ds.js';
      },
    },
    rollupOptions: {
      // No external deps — zero runtime dependencies is a design goal
    },
    // Don't minify in library mode — consumers' bundlers will handle that
    minify: false,
    // Generate source maps for debugging
    sourcemap: true,
    // Clean dist before build
    emptyOutDir: true,
    // Target modern browsers
    target: 'es2022',
  },
});
