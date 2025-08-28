import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type UserConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';

const config: UserConfig = {
  server: {
    port: 3000,
  },
  plugins: [
    devtools({
      enhancedLogs: {
        enabled: true,
      },
    }),
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStart({
      target: 'vercel',
      customViteReactPlugin: true,
    }),
    tailwindcss(),
    react(),
  ],
};

export default defineConfig(config);
