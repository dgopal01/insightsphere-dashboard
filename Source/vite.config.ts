import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on mode
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';
  const isStaging = mode === 'staging';

  return {
    plugins: [
      react({
        // Optimize JSX runtime
        jsxRuntime: 'automatic',
      }),
      // Sentry plugin for source maps and release tracking
      // Only enable in production/staging builds with Sentry configured
      ...((isProd || isStaging) && env.VITE_SENTRY_DSN
        ? [
            sentryVitePlugin({
              org: env.SENTRY_ORG,
              project: env.SENTRY_PROJECT,
              authToken: env.SENTRY_AUTH_TOKEN,
              telemetry: false,
              // Upload source maps only in production
              sourcemaps: {
                assets: './dist/**',
              },
            }),
          ]
        : []),
    ],
    build: {
      // Enable minification for production builds (Requirement 12.4)
      minify: isProd ? 'terser' : 'esbuild',
      // Terser options for better compression
      terserOptions: isProd
        ? {
            compress: {
              drop_console: true, // Remove console.log in production
              drop_debugger: true,
              pure_funcs: ['console.log', 'console.debug'], // Remove specific console methods
            },
            format: {
              comments: false, // Remove comments
            },
          }
        : undefined,
      // Optimize chunk splitting for better caching (Requirement 12.2, 12.3)
      rollupOptions: {
        output: {
          // Manual chunk splitting for vendor libraries
          manualChunks: (id) => {
            // Keep React and React-DOM together to avoid duplicate instances
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')
            ) {
              return 'react-vendor';
            }
            // React Router
            if (id.includes('node_modules/react-router')) {
              return 'router-vendor';
            }
            // Material-UI and Emotion (they depend on React)
            if (id.includes('node_modules/@mui') || id.includes('node_modules/@emotion')) {
              return 'mui-vendor';
            }
            // AWS Amplify
            if (
              id.includes('node_modules/aws-amplify') ||
              id.includes('node_modules/@aws-amplify')
            ) {
              return 'aws-vendor';
            }
            // React Query
            if (id.includes('node_modules/@tanstack/react-query')) {
              return 'query-vendor';
            }
            // Recharts (if used)
            if (id.includes('node_modules/recharts')) {
              return 'chart-vendor';
            }
            // React Window (virtualization)
            if (id.includes('node_modules/react-window')) {
              return 'virtualization-vendor';
            }
            // Other node_modules
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
          // Optimize chunk file names for caching
          chunkFileNames: isProd ? 'assets/js/[name]-[hash].js' : 'assets/js/[name].js',
          entryFileNames: isProd ? 'assets/js/[name]-[hash].js' : 'assets/js/[name].js',
          assetFileNames: isProd ? 'assets/[ext]/[name]-[hash].[ext]' : 'assets/[ext]/[name].[ext]',
        },
      },
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
      // Enable source maps based on environment (Requirement 12.5)
      sourcemap: env.VITE_ENABLE_SOURCE_MAPS === 'true',
      // Target modern browsers for better optimization
      target: 'es2020',
      // Enable CSS code splitting
      cssCodeSplit: true,
      // Optimize asset inlining
      assetsInlineLimit: 4096, // 4kb
      // Report compressed size
      reportCompressedSize: isProd,
    },
    // Optimize dependencies (Requirement 12.3)
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@mui/material',
        '@mui/icons-material',
        '@emotion/react',
        '@emotion/styled',
        '@tanstack/react-query',
        'aws-amplify',
        '@aws-amplify/ui-react',
      ],
      // Exclude large dependencies that should be loaded on demand
      exclude: ['recharts'],
    },
    // Ensure single instance of React
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Server configuration for development
    server: {
      port: 3000,
      open: true,
      cors: true,
    },
    // Preview server configuration
    preview: {
      port: 4173,
      open: true,
    },
    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
  };
});
