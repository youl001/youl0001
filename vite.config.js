import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/youl0001/' : '/',
  plugins: [react()],
  server: {
    watch: {
      ignored: ['**/qa/chrome-profile/**'],
    },
  },
})
