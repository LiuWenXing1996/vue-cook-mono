import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'node:path'
import pkgJson from './package.json'
import dts from 'vite-plugin-dts'
import type { ProjectManifest } from '@pnpm/types'
import svgLoader from 'vite-svg-loader'

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
    dts({ tsconfigPath: resolve(__dirname, './tsconfig.dts.json'), rollupTypes: true }),
    vue(),
    vueJsx(),
    svgLoader()
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
