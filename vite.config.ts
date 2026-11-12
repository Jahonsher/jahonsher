import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages: sayt https://jahonsher.github.io/jahonsher/ manzilida ochiladi
  base: '/jahonsher/',
  plugins: [react(), tailwindcss()],
})
