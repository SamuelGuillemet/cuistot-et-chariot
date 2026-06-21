import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig, type UserConfig } from 'vite';

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
    tanstackStart(),
    nitro({
      preset: 'vercel',
    }),
    tailwindcss(),
    react(),
  ],
  ssr: {
    noExternal: ['@convex-dev/better-auth'],
  },
  resolve: {
    tsconfigPaths: true,
  },
};

export default defineConfig(config);
