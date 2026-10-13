import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative paths let the app work on GitHub Pages project URLs.
export default defineConfig({
  base: './',
  plugins: [react()],
})
