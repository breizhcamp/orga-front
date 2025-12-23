import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import svgLoader from 'vite-svg-loader'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), svgLoader()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  server: {
    proxy: {
      '/admin': 'http://localhost:4006',
      '/kalon': {
        target: 'http://localhost:4007/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/kalon/, '')
      },
      '/konter': {
        target: 'http://localhost:4008/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/konter/, '')
      },
      '/moneiz': {
        target: 'http://localhost:4005/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/moneiz/, '')
      },
    }
  }
})
