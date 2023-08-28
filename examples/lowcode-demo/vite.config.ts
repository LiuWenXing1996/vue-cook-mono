import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import VueCookVitePlugin from '@vue-cook/vite-plugin'
import path from 'node:path'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  // plugins: [
  //   VueCookVitePlugin({
  //     pkgJsonPath: path.join(__dirname, './package.json'),
  //     cookConfigPath: path.join(__dirname, './cook.config.json')
  //   })
  // ],
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      // entry: [resolve(__dirname, 'container.ts'),resolve(__dirname, 'src/index.ts')],
      entry: resolve(__dirname, 'container.ts'),
      formats: ['cjs'],
      name: 'ss'
    },
    cssCodeSplit: true,
    rollupOptions: {
      external: ['vue', '@vue-cook/core', 'element-plus']
    },
    minify: false
  }
})
