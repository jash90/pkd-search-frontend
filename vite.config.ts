import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import remarkGfm from 'remark-gfm';
import compression from 'vite-plugin-compression';

const LEGACY_PREFIXES = ['/szukaj', '/search', '/samples'];

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    { enforce: 'pre', ...mdx({ remarkPlugins: [remarkGfm] }) },
    react({ include: /\.(jsx|tsx|mdx)$/ }),
    compression({ algorithm: 'gzip', ext: '.gz', threshold: 10240, deleteOriginFile: false }),
    compression({ algorithm: 'brotliCompress', ext: '.br', threshold: 10240, deleteOriginFile: false }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
      },
      mangle: { safari10: true },
      format: { comments: false },
    },
    rollupOptions: {
      output: isSsrBuild
        ? undefined
        : {
            manualChunks: {
              vendor: ['react', 'react-dom', 'react-helmet-async'],
              utils: ['axios'],
              motion: ['framer-motion'],
            },
          },
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
  },
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
    concurrency: 4,
    includedRoutes(paths) {
      return paths.filter((rawPath) => {
        const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
        if (path === '/*') return false;
        return !LEGACY_PREFIXES.some(
          (prefix) => path === prefix || path.startsWith(`${prefix}/`),
        );
      });
    },
  },
}));
