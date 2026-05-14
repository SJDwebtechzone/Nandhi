import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // All built assets/links live under /admin/ in production
  // (the site is served at https://nandhitv.com/admin).
  base: '/admin/',
  server: {
    port: 5174,
    // Proxy /api requests to the backend during dev so the admin can call
    // the API without CORS pre-flights.
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
