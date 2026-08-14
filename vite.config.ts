
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';
  import tailwindcss from '@tailwindcss/vite';
  import path from 'path';

  export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        // Especificadores versionados (pkg@1.2.3) foram removidos do código:
        // quebravam depcheck/knip/npm ls e escondiam dependências mortas.
        // Só o protocolo virtual figma:asset precisa de alias.
        'figma:asset/d08376795895de90a85e101961d369a69979dcc3.png': path.resolve(__dirname, './src/assets/d08376795895de90a85e101961d369a69979dcc3.png'),
        'figma:asset/59bd61ee57b1d1995ade3564db5bcf01cca3ad34.png': path.resolve(__dirname, './src/assets/59bd61ee57b1d1995ade3564db5bcf01cca3ad34.png'),
        'figma:asset/41992400f7ce7c6df57ddb041fe5f801c2e327d9.png': path.resolve(__dirname, './src/assets/41992400f7ce7c6df57ddb041fe5f801c2e327d9.png'),
        'figma:asset/0049d96aabf7ea4e2a663d5f83ebd360cb225dfd.png': path.resolve(__dirname, './src/assets/0049d96aabf7ea4e2a663d5f83ebd360cb225dfd.png'),
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
      rollupOptions: {
        output: {
          // Split by ownership/change-rate, not by micro-optimisation.
          // react/motion/icons change rarely -> long-lived cache entries.
          // The pdf stack is only needed on export -> keep it off the critical path.
          manualChunks(id: string) {
            // O helper de preload do Vite acabava alojado no chunk do PDF.
            // Como ele é importado estaticamente pela entry, isso arrastava
            // ~1,5 MB de jspdf/html2canvas para o boot. Fixamos no chunk do
            // React, que já é carregado de qualquer forma.
            if (id.includes('vite/preload-helper')) return 'vendor-react';
            if (!id.includes('node_modules')) return;
            const parts = id.split('node_modules/');
            const pkgPath = parts[parts.length - 1];
            const pkg = pkgPath.startsWith('@')
              ? pkgPath.split('/').slice(0, 2).join('/')
              : pkgPath.split('/')[0];

            if (pkg === 'jspdf' || pkg === 'html2canvas' || pkg === 'html2pdf.js') {
              return 'vendor-pdf';
            }
            if (pkg === 'motion' || pkg === 'framer-motion' || pkg.startsWith('motion-')) {
              return 'vendor-motion';
            }
            if (pkg === 'lucide-react') return 'vendor-icons';
            if (
              pkg === 'react' ||
              pkg === 'react-dom' ||
              pkg === 'scheduler' ||
              pkg === 'react-is' ||
              pkg === 'object-assign'
            ) {
              return 'vendor-react';
            }
            return 'vendor';
          },
        },
      },
    },
    server: {
      port: 3000,
      open: true,
    },
  });