import { defineConfig, createLogger } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Custom logger to suppress source map warnings from node_modules
const logger = createLogger();
const originalWarning = logger.warn;
logger.warn = (msg, options) => {
  // Suppress source map errors from MediaPipe and other node_modules
  if (msg.includes('Failed to load source map') && msg.includes('node_modules')) {
    return;
  }
  originalWarning(msg, options);
};

export default defineConfig({
  plugins: [react()],
  base: './',
  customLogger: logger,
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
      onwarn(warning, warn) {
        // Suppress source map warnings from third-party packages
        if (warning.code === 'SOURCEMAP_ERROR') {
          return;
        }
        warn(warning);
      },
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
    // Ignore source maps from node_modules
    sourcemapIgnoreList: (sourcePath) => sourcePath.includes('node_modules'),
  },
  // Optimize deps to exclude WASM-related packages from pre-bundling
  optimizeDeps: {
    exclude: ['@mediapipe/tasks-vision'],
  },
});
