import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export const generateExternal = () => {
  const nodeBuildinLibs = [
    'node:util',
    'node:buffer',
    'node:stream',
    'node:net',
    'node:url',
    'node:fs',
    'node:path',
    'perf_hooks'
  ]
  return (id: string) => {
    const packages: string[] = [...nodeBuildinLibs]
    return [...new Set(packages)].some((pkg) => id === pkg || id.startsWith(`${pkg}/`))
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [nodePolyfills()],
  publicDir: false,
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      { find: 'process', replacement: 'process/browser' }
    ]
  },
  build: {
    minify: false,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['cjs', 'es'],
      fileName: (format) => {
        if (format == 'cjs') {
          return 'index.cjs'
        }
        if (format == 'es') {
          return 'index.js'
        }
        return `index.${format}.js`
      }
    },
    rollupOptions: {
      external: generateExternal()
    }
  }
})
