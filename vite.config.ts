import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  // Set base for GitHub Pages; change to your repo name or '/' if using a custom domain
  base: '/Sky_AIO/',
  plugins: [vue()],
})
