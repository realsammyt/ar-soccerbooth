import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'r3f': ['@react-three/fiber', '@react-three/drei'],
          'mediapipe': ['@mediapipe/tasks-vision'],
        },
      },
    },
    // Copy WASM files to output without processing
    copyPublicDir: true,
  },
  // Ensure WASM files are served with correct MIME type
  assetsInclude: ['**/*.wasm', '**/*.task', '**/*.hdr'],
  server: {
    port: 5173,
    // Configure proper MIME types for development
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  // Optimize deps to exclude WASM-related packages from pre-bundling
  optimizeDeps: {
    exclude: ['@mediapipe/tasks-vision'],
  },
});
