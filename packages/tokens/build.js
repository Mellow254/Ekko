import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import StyleDictionary from 'style-dictionary';
import { getFileHeader, themedCssFormat } from './utils/format.js';

// Custom transforms
StyleDictionary.registerTransform({
  name: 'ekko/dimension/css',
  type: 'value',
  filter: (token) => token.$type === 'dimension',
  transform: (token) => {
    const val = token.$value ?? token.value;
    if (typeof val === 'object' && val.value !== undefined) return `${val.value}${val.unit}`;
    return String(val);
  },
});

StyleDictionary.registerTransform({
  name: 'ekko/color/css',
  type: 'value',
  filter: (token) => token.$type === 'color',
  transform: (token) => {
    const val = token.$value ?? token.value;
    if (typeof val === 'object' && val.hex) {
      if (val.alpha !== undefined && val.alpha !== 1) {
        const hex = val.hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgb(${r} ${g} ${b} / ${val.alpha})`;
      }
      return val.hex;
    }
    return String(val);
  },
});

StyleDictionary.registerTransform({
  name: 'ekko/duration/css',
  type: 'value',
  filter: (token) => token.$type === 'duration',
  transform: (token) => {
    const val = token.$value ?? token.value;
    if (typeof val === 'object' && val.value !== undefined) return `${val.value}${val.unit}`;
    return String(val);
  },
});

StyleDictionary.registerTransformGroup({
  name: 'ekko/css',
  transforms: [
    'attribute/cti',
    'name/kebab',
    'ekko/dimension/css',
    'ekko/color/css',
    'fontFamily/css',
    'ekko/duration/css',
    'cubicBezier/css',
    'shadow/css/shorthand',
  ],
});

StyleDictionary.registerTransformGroup({
  name: 'ekko/js',
  transforms: [
    'attribute/cti',
    'name/camel',
    'ekko/dimension/css',
    'ekko/color/css',
    'fontFamily/css',
    'ekko/duration/css',
    'cubicBezier/css',
    'shadow/css/shorthand',
  ],
});

// Custom format
StyleDictionary.registerFormat({
  name: 'ekko/themed-css',
  format: themedCssFormat,
});

//  Build helper
const build = async ({ source, platforms, label }) => {
  const sd = new StyleDictionary({
    source,
    platforms,
    log: { warnings: 'disabled' },
  });
  await sd.cleanAllPlatforms();
  await sd.buildAllPlatforms();
  console.log(`  ✔ ${label}`);
};

// Light-only sources (exclude dark.json for the base build)
const LIGHT_SOURCES = [
  'tokens/base/**/*.json',
  'tokens/semantic/spacing.json',
  'tokens/semantic/radius.json',
  'tokens/semantic/typography.json',
  'tokens/semantic/focus.json',
  'tokens/semantic/transition.json',
  'tokens/semantic/colors/light.json',
  'tokens/component/**/*.json',
];

// All sources including dark (for the themed build)
const ALL_SOURCES = [...LIGHT_SOURCES, 'tokens/semantic/colors/dark.json'];

console.log('\nBuilding Ekko tokens...\n');

// 1. Base build (light-only)
console.log('Base (light):');
await build({
  label: 'CSS + JS + JSON',
  source: LIGHT_SOURCES,
  platforms: {
    css: {
      transformGroup: 'ekko/css',
      prefix: 'ekko',
      buildPath: 'dist/css/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            outputReferences: true,
            selector: ':root',
            fileHeader: getFileHeader,
          },
        },
      ],
    },
    esm: {
      transformGroup: 'ekko/js',
      buildPath: 'dist/js/',
      files: [
        {
          destination: 'tokens.mjs',
          format: 'javascript/es6',
          options: {
            fileHeader: () => ['Ekko Design System — JS Token Constants', 'Do not edit directly.'],
          },
        },
      ],
    },
    json: {
      transformGroup: 'ekko/css',
      buildPath: 'dist/json/',
      files: [{ destination: 'tokens.flat.json', format: 'json/flat' }],
    },
  },
});

// 2. Dark mode overrides

console.log('\nDark mode:');

// Build all sources with dark tokens included, then extract dark-only vars
await build({
  label: 'dark vars (temp)',
  source: ALL_SOURCES,
  platforms: {
    css: {
      transformGroup: 'ekko/css',
      prefix: 'ekko',
      buildPath: 'dist/css/',
      files: [
        {
          destination: '_dark-tmp.css',
          format: 'css/variables',
          options: { outputReferences: false, selector: ':root' },
        },
      ],
    },
  },
});

// Read both light and dark builds, extract only the variables that differ
const lightContent = readFileSync('dist/css/tokens.css', 'utf8');
const darkFullContent = readFileSync('dist/css/_dark-tmp.css', 'utf8');

const parseVars = (css) => {
  const vars = {};
  const re = /^\s*(--[\w-]+):\s*(.+);$/gm;
  for (let m = re.exec(css); m !== null; m = re.exec(css)) {
    vars[m[1]] = m[2];
  }
  return vars;
};

const lightVars = parseVars(lightContent);
const darkFullVars = parseVars(darkFullContent);

// Only keep variables that actually changed in dark mode
const darkOverrides = [];
for (const [name, value] of Object.entries(darkFullVars)) {
  if (lightVars[name] !== value) {
    darkOverrides.push(`  ${name}: ${value};`);
  }
}

const darkVarsBlock = darkOverrides.join('\n');

writeFileSync(
  'dist/css/tokens.dark.css',
  `/**
 * Ekko Design System — Dark Mode Token Overrides
 * Load after tokens.css. Applies via system preference AND manual [data-theme="dark"].
 * Do not edit directly.
 */

@media (prefers-color-scheme: dark) {
  :root {
${darkVarsBlock.replace(/^ {2}/gm, '    ')}
  }
}

[data-theme="dark"] {
${darkVarsBlock}
}
`
);

// Clean up temp file
try {
  const { unlinkSync } = await import('node:fs');
  unlinkSync('dist/css/_dark-tmp.css');
} catch {}

console.log('  ✔ dist/css/tokens.dark.css');

// 3. Combined output

console.log('\nCombined:');

const lightCss = readFileSync('dist/css/tokens.css', 'utf8');
const darkCss = readFileSync('dist/css/tokens.dark.css', 'utf8');

mkdirSync('dist/css', { recursive: true });
writeFileSync('dist/css/tokens.all.css', `${lightCss}\n${darkCss}`);

console.log('  ✔ dist/css/tokens.all.css');
console.log('\n✅ All token builds complete.\n');
