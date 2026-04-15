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
      output: [
        // The standard bundles
        {
          format: 'es',
          entryFileNames: 'ekko-ds.esm.js',
          dir: 'dist',
        },
        {
          format: 'cjs',
          entryFileNames: 'ekko-ds.cjs.js',
          dir: 'dist',
        },
        // Preserved modules per-component
        {
          format: 'es',
          dir: 'dist',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: (chunkInfo) => {
            // The `?inline` CSS imports resolve to a virtual module whose
            // facadeModuleId ends with `.css?inline`. If we let them keep the
            // default `[name].js` they collide with the sibling `index.ts`
            // (both want `dist/{component}/index.js`), and rollup silently
            // renames the component to `index2.js` — breaking subpath imports.
            const id = chunkInfo.facadeModuleId ?? '';
            if (id.includes('?inline') || id.endsWith('.css')) {
              return '[name].css.js';
            }
            return '[name].js';
          },
        },
      ],
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
