import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/tires/' : '/',
  define: {
    // Support button link, set at build time (CI: SUPPORT_URL secret or variable).
    // The URL is never kept in the source.
    __SUPPORT_URL__: JSON.stringify(process.env.SUPPORT_URL ?? '')
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
