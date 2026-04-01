import type { Preview } from '@storybook/web-components';
import '@ekko-ds/tokens/css';
import '@ekko-ds/components';

const preview: Preview = {
  parameters: {
    // Accessibility addon — runs axe-core on every story
    a11y: {
      test: 'error',
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'button-name', enabled: true },
        ],
      },
    },
    // Default backgrounds that make token colour choices visible
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#FAFAFA' },
        { name: 'dark', value: '#171717' },
        { name: 'white', value: '#FFFFFF' },
      ],
    },
    // Viewport presets for responsive testing
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '390px', height: '844px' } },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1280px', height: '900px' },
        },
      },
    },
    // Docs page configuration
    docs: {
      toc: true,
    },
  },
  // Enables auto-generated documentation for all stories
  tags: ['autodocs'],
  // Global decorator — wraps every story in a div with the token styles
  decorators: [(story) => story()],
};

export default preview;
