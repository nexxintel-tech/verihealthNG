import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5001,
    host: '0.0.0.0',
    // Allow all hosts for Replit's dynamic preview URLs
    allowedHosts: 'all',
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
