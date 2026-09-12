import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom domain (astrelle.pl via CNAME) → base '/'
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    // No manualChunks on purpose: the 3D components are dynamically imported
    // (src/three/*), so Rollup keeps three + r3f + drei in a chunk that only the
    // pages with a model fetch. Grouping them by hand pulled React into the r3f
    // chunk, which made the entry import three on every page.
    chunkSizeWarningLimit: 1400,
  },
})
