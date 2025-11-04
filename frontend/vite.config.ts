import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import istanbul from 'vite-plugin-istanbul';

export default defineConfig({
  plugins: [
    react(),
    istanbul({
      include: 'src/*',
      exclude: ['node_modules', 'cypress', '**/*.spec.ts', '**/*.test.ts'],
      extension: ['.js', '.ts', '.tsx', '.jsx'],
      requireEnv: false,
      cypress: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages')
    }
  },
  server: {
    host: '0.0.0.0',  // ⚠️ Ajoutez cette ligne
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
});