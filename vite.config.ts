
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';
  import tailwindcss from '@tailwindcss/vite';
  import path from 'path';

  export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'vaul@1.1.2': 'vaul',
        'sonner@2.0.3': 'sonner',
        'recharts@2.15.2': 'recharts',
        'react-resizable-panels@2.1.7': 'react-resizable-panels',
        'react-hook-form@7.55.0': 'react-hook-form',
        'react-day-picker@8.10.1': 'react-day-picker',
        'next-themes@0.4.6': 'next-themes',
        'lucide-react@0.487.0': 'lucide-react',
        'input-otp@1.4.2': 'input-otp',
        'figma:asset/d08376795895de90a85e101961d369a69979dcc3.png': path.resolve(__dirname, './src/assets/d08376795895de90a85e101961d369a69979dcc3.png'),
        'figma:asset/59bd61ee57b1d1995ade3564db5bcf01cca3ad34.png': path.resolve(__dirname, './src/assets/59bd61ee57b1d1995ade3564db5bcf01cca3ad34.png'),
        'figma:asset/41992400f7ce7c6df57ddb041fe5f801c2e327d9.png': path.resolve(__dirname, './src/assets/41992400f7ce7c6df57ddb041fe5f801c2e327d9.png'),
        'figma:asset/0049d96aabf7ea4e2a663d5f83ebd360cb225dfd.png': path.resolve(__dirname, './src/assets/0049d96aabf7ea4e2a663d5f83ebd360cb225dfd.png'),
        'embla-carousel-react@8.6.0': 'embla-carousel-react',
        'cmdk@1.1.1': 'cmdk',
        'class-variance-authority@0.7.1': 'class-variance-authority',
        '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
        '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
        '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
        '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
        '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
        '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
        '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
        '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
        '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
        '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
        '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
        '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
        '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
        '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
        '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
        '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
        '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
        '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
        '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
        '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
        '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
        '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
        '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
        '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
      rollupOptions: {
        output: {
          // Split by ownership/change-rate, not by micro-optimisation.
          // react/radix/recharts change rarely -> long-lived cache entries.
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
            if (pkg.startsWith('@radix-ui')) return 'vendor-radix';
            if (pkg === 'recharts' || pkg === 'victory-vendor' || pkg.startsWith('d3-')) {
              return 'vendor-charts';
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