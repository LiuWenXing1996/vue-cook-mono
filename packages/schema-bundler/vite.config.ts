import { fileURLToPath, URL } from 'node:url'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vite'
import pkgJson from './package.json'
import { resolve } from 'node:path'
import type { ProjectManifest } from '@pnpm/types'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export const getPackageDependencies = () => {
  const {
    dependencies = {},
    peerDependencies = {},
    devDependencies = {}
  } = pkgJson as ProjectManifest

  return {
    dependencies: Object.keys(dependencies),
    peerDependencies: Object.keys(peerDependencies),
    devDependencies: Object.keys(devDependencies)
  }
}

export const generateExternal = () => {
  const { dependencies, peerDependencies, devDependencies } = getPackageDependencies()
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
    const packages: string[] = [
      '@vue',
      ...nodeBuildinLibs,
      ...peerDependencies,
      ...devDependencies,
      ...dependencies
    ]
    return [...new Set(packages)].some((pkg) => id === pkg || id.startsWith(`${pkg}/`))
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [dts({ tsconfigPath: resolve(__dirname, './tsconfig.dts.json'), rollupTypes: true })],
  publicDir: false,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
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
