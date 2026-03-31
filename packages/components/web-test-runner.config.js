import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { playwrightLauncher } from '@web/test-runner-playwright';

/**
 * Plugin to handle Vite-style `?inline` CSS imports.
 * Rewrites the import to a virtual in memory .css.js path, then serves the CSS as a JS module.
 * for the web test runner, which doesn't support Vite's `?inline` out of the box.
 */
const inlineCssPlugin = () => {
  return {
    name: 'inline-css',
    transform(context) {
      if (context.path.endsWith('.ts') || context.path.endsWith('.js')) {
        const body = context.body;
        // trick web test runner into treating .css?inline imports as JS modules by rewriting the import path to .css.inline.js
        if (typeof body === 'string' && body.includes('.css?inline')) {
          return {
            body: body.replace(/(['"])([^'"]+\.css)\?inline\1/g, '$1$2.inline.js$1'),
          };
        }
      }
    },
    resolveMimeType(context) {
      if (context.path.endsWith('.css.inline.js')) {
        // Treat the virtual .css.inline.js files as JavaScript modules
        return 'js';
      }
    },
    serve(context) {
      if (context.path.endsWith('.css.inline.js')) {
        const cssPath = context.path.replace('.inline.js', '');
        const fullPath = resolve(`.${cssPath}`);
        try {
          // Read the CSS file and serve it as a JS module exporting the CSS string
          const css = readFileSync(fullPath, 'utf8');
          return { body: `export default ${JSON.stringify(css)};`, type: 'js' };
        } catch {
          return undefined;
        }
      }
    },
  };
};

export default {
  files: 'tests/**/*.test.ts',
  nodeResolve: true,
  plugins: [inlineCssPlugin(), esbuildPlugin({ ts: true })],
  browsers: [playwrightLauncher({ product: 'chromium' })],
  concurrency: 4,
  coverage: true,
  coverageConfig: {
    reportDir: 'coverage',
    include: ['src/**/*.ts'],
    threshold: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
  },
};
