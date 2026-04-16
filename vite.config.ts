import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig, type UserConfig } from 'vite';

const config: UserConfig = {
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3000,
  },
  plugins: [
    devtools(),
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
};

export default defineConfig(config);
