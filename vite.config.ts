import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    devtools({
      enhancedLogs: {
        enabled: true,
      },
    }),
    tanstackStart(),
    nitro({
      preset: 'vercel',
    }),
    tailwindcss(),
    react({ compiler: true }),
  ],
  ssr: {
    noExternal: ['@convex-dev/better-auth'],
  },
  resolve: {
    tsconfigPaths: true,
  },
  fmt: {
    ignorePatterns: [
      '**/dist',
      '**/node_modules',
      '**/.output',
      '**/.nitro',
      '**/.tanstack',
      '**/.vercel',
      'convex/_generated/*',
      '**/routeTree.gen.ts',
    ],
    useTabs: false,
    tabWidth: 2,
    singleQuote: true,
    semi: true,
    sortImports: {
      newlinesBetween: false,
    },
    sortTailwindcss: {
      functions: ['cn', 'cva'],
      stylesheet: './src/index.css',
    },
  },
  lint: {
    plugins: [
      'typescript',
      'oxc',
      'unicorn',
      'react',
      'react-perf',
      'jsx-a11y',
      'import',
      'eslint',
    ],
    ignorePatterns: [
      '**/dist',
      '**/node_modules',
      '**/.output',
      '**/.nitro',
      '**/.tanstack',
      '**/.vercel',
      'convex/_generated/*',
      '**/routeTree.gen.ts',
    ],
    jsPlugins: [
      '@shadcn/lint',
      {
        name: 'vite-plus',
        specifier: 'vite-plus/oxlint-plugin',
      },
    ],
    env: {
      browser: true,
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    settings: {
      react: {
        version: '19.2.7',
      },
    },
    rules: {
      'jsx-a11y/no-autofocus': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
      'jsx-a11y/prefer-tag-over-role': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'no-unused-vars': [
        'error',
        {
          fix: {
            imports: 'safe-fix',
            variables: 'off',
          },
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'shadcn/no-arbitrary-values': 'error',
      'vite-plus/prefer-vite-plus-imports': 'error',
    },
    overrides: [
      {
        files: ['src/components/ui/**/*.tsx'],
        rules: {
          'shadcn/no-arbitrary-values': 'off',
        },
      },
    ],
  },
  staged: {
    '*': 'vp check --fix',
  },
});
