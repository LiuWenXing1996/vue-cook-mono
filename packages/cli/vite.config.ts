import { defineConfig } from 'vite'
import nodePolyfills from 'rollup-plugin-polyfill-node'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [nodePolyfills()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'cli'
    },
    rollupOptions: {
      external: [
        'esbuild',
        'url',
        'dayjs',
        'unplugin-vue',
        'unplugin-vue/esbuild'
      ]
    }
  }
})
