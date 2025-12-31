import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path must match GitHub Pages repo name so built asset URLs resolve there.
  base: '/Les-Paulverizer-website/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        BTInstructions: resolve(__dirname, 'BTInstructions/index.html'),
      },
    },
  },
})
