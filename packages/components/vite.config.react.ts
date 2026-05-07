import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/wrappers/react/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    outDir: 'dist/wrappers/react',
    emptyOutDir: false,
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', '@lit/react'],
    },
    minify: false,
    sourcemap: true,
    target: 'es2022',
  },
});
