import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { autoDepsPlugin } from '@vue-cook/vite-plugin'
import path from 'node:path'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    open: true
  },
  plugins: [
    vue(),
    autoDepsPlugin({
      pkgJsonPath: path.join(__dirname, './package.json'),
      cookConfigPath: path.join(__dirname, './cook.config.json')
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
