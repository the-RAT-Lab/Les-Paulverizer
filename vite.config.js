import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base must match the GitHub Pages repo path for correct asset URLs.
  base: '/Les-Paulverizer/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        BTInstructions: resolve(__dirname, 'BTInstructions/index.html'),
      },
    },
  },
})
