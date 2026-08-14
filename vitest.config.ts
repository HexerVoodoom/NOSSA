import { defineConfig } from 'vitest/config';
import viteConfig from './vite.config';

// Reaproveita os aliases do vite.config.ts (especificadores versionados como
// `lucide-react@0.487.0` e `figma:asset/...`). Duplicá-los aqui à mão faria os
// imports quebrarem silenciosamente sempre que o vite.config mudasse.
const aliases = (viteConfig as { resolve?: { alias?: Record<string, string> } }).resolve?.alias ?? {};

export default defineConfig({
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: { ...aliases },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
  },
});
