/**
 * Custom format utilities for Ekko token builds.
 */

export const getFileHeader = () => [
  'Ekko Design System — CSS Custom Properties',
  'Do not edit directly.',
];

/**
 * Partition dictionary tokens into light-mode and dark-mode sets
 * based on their source file path.
 */
const partitionByMode = (dictionary) => {
  const light = [];
  const dark = [];
  for (const token of dictionary.allTokens) {
    if (token.filePath.includes('dark')) {
      dark.push(token);
    } else {
      light.push(token);
    }
  }
  return { light, dark };
};

/**
 * Format a single token as a CSS custom property line.
 */
const formatProperty = (token, prefix) => {
  const name = prefix ? `--${prefix}-${token.name}` : `--${token.name}`;
  return `  ${name}: ${token.value};`;
};

/**
 * Custom Style Dictionary format that generates themed CSS with:
 * - `:root` for light mode (default)
 * - `@media (prefers-color-scheme: dark) { :root { ... } }` for system dark
 * - `[data-theme="dark"] { ... }` for manual dark toggle
 *
 * Only outputs tokens that differ between light and dark (semantic colors + focus).
 * Base and component tokens are not theme-aware and go in the light `:root` block.
 */
export const themedCssFormat = ({ dictionary, options }) => {
  const prefix = options?.prefix ?? '';
  const { light, dark } = partitionByMode(dictionary);

  const lightLines = light.map((t) => formatProperty(t, prefix)).join('\n');
  const darkLines = dark.map((t) => formatProperty(t, prefix)).join('\n');

  let output = `/**\n * ${getFileHeader().join('\n * ')}\n */\n\n`;
  output += `:root {\n${lightLines}\n}\n`;

  if (darkLines) {
    output += `\n@media (prefers-color-scheme: dark) {\n  :root {\n${darkLines.replace(/^ {2}/gm, '    ')}\n  }\n}\n`;
    output += `\n[data-theme="dark"] {\n${darkLines}\n}\n`;
  }

  return output;
};
