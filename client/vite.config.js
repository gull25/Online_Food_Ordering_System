import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      // Used when VITE_API_URL is unset, so the dev client can talk to the API
      // same-origin and skip CORS entirely.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  build: {
    // Source maps are not emitted: they would publish the full readable source,
    // including the shape of every API call, alongside the production bundle.
    sourcemap: false,
    // Warn at a size that means something for this app rather than the 500 kB
    // default that every chunk below already clears.
    chunkSizeWarningLimit: 300,

    rollupOptions: {
      output: {
        /*
         * Vendor code is split by library so a release that touches only app
         * code does not invalidate the cached copy of React, Leaflet and
         * Chart.js along with it. Leaflet and Chart.js in particular are large
         * and only used on two screens each, so keeping them out of the entry
         * chunk is what stops the home page paying for the admin dashboard.
         */
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined;

          if (id.includes('react-icons')) return 'vendor-icons';
          if (id.includes('socket.io-client') || id.includes('engine.io')) return 'vendor-socket';
          if (id.includes('react-hook-form') || id.includes('/zod/') || id.includes('@hookform')) {
            return 'vendor-forms';
          }
          if (id.includes('react-leaflet') || id.includes('/leaflet')) return 'vendor-maps';
          if (id.includes('chart.js') || id.includes('react-chartjs')) return 'vendor-charts';
          if (id.includes('@stripe')) return 'vendor-stripe';
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('react-redux') || id.includes('@reduxjs')) return 'vendor-redux';
          if (id.includes('react-router')) return 'vendor-router';
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) {
            return 'vendor-react';
          }

          return 'vendor';
        },
      },
    },
  },

  esbuild: {
    /*
     * `console.log` and `console.debug` are stripped from production builds;
     * `console.error` and `console.warn` are kept so real failures still leave a
     * trace. Several screens log fetch responses, which is noise at best and a
     * disclosure of API payload shapes at worst.
     */
    pure: process.env.NODE_ENV === 'production' ? ['console.log', 'console.debug'] : [],
  },
});
