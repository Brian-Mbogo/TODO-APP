import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Use relative base so the built app works on GitHub Pages / static hosting.
  base: './',
  server: {
    port: 3000
  }
})
