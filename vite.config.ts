import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { contentPlugin } from './plugins/content'

// The app version is NOT injected via `define` here. wrangler bundles the Worker with
// esbuild and never reads this file, so a define would work in the client and throw at
// the edge. Both sides import src/generated/version.ts instead (scripts/gen-version.mjs).

export default defineConfig({
  plugins: [contentPlugin(), react()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  ssgOptions: {
    // Emit fr/index.html rather than fr.html, so "/fr/" is the canonical URL that
    // actually serves content. With flat output Cloudflare 307s "/fr/" → "/fr", which
    // breaks the trailing-slash URLs §5 specifies and costs every visitor a redirect.
    dirStyle: 'nested',
  },

  build: {
    // Wrangler serves this directory as static assets (wrangler.jsonc → assets.directory).
    outDir: 'dist/client',
    emptyOutDir: true,
    // Content-hashed filenames: a new build is physically a different URL, so a stale
    // cached asset can never shadow a fresh deploy.
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
    // Quality floor § 10: total JS under 120KB gzipped. Warn well before that.
    chunkSizeWarningLimit: 150,
    target: 'es2022',
    sourcemap: false,
  },

  server: {
    port: 5173,
    strictPort: true,
  },

  preview: {
    port: 4173,
    strictPort: true,
  },
})
