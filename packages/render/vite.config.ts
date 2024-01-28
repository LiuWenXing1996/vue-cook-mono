import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'node:path'
import pkgJson from './package.json'
import dts from 'vite-plugin-dts'
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
  // const excludeDeps = ['memfs']

  return (id: string) => {
    let packages: string[] = ['@vue', ...peerDependencies, ...devDependencies, ...dependencies]
    // packages = packages.filter((e) => !excludeDeps.includes(e))
    return [...new Set(packages)].some((pkg) => id === pkg || id.startsWith(`${pkg}/`))
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dts({ tsconfigPath: resolve(__dirname, './tsconfig.dts.json'), rollupTypes: false }),
    vue(),
    vueJsx()
  ],
  define: {
    __VUE_PROD_DEVTOOLS__: true
  },
  publicDir: false,
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    minify: false,
    sourcemap: true,
    lib: {
      entry: {
        runtime: resolve(__dirname, 'src/runtime.ts'),
        design: resolve(__dirname, 'src/design.ts')
      },
      formats: ['cjs', 'es'],
      fileName: (format, entryName) => {
        if (format == 'cjs') {
          return `${entryName}.cjs`
        }
        if (format == 'es') {
          return `${entryName}.js`
        }
        return `${entryName}.${format}.js`
      }
    },
    rollupOptions: {
      external: generateExternal()
    }
  }
})
