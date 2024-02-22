import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { extname, join, resolve } from 'node:path'
import pkgJson from './package.json'
import dts from 'vite-plugin-dts'
import type { ProjectManifest } from '@pnpm/types'
import { readdir, stat } from 'fs/promises'

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
  console.log('packages', ['@vue', ...peerDependencies, ...devDependencies, ...dependencies])
  return (id: string) => {
    const packages: string[] = ['@vue', ...peerDependencies, ...devDependencies, ...dependencies]
    return [...new Set(packages)].some((pkg) => id === pkg || id.startsWith(`${pkg}/`))
  }
}
// console.log('generateExternal', generateExternal())

const listFiles = async (dir?: string) => {
  const files: string[] = []
  dir = dir || '/'
  const getFiles = async (currentDir: string) => {
    const fileList = (await readdir(currentDir)) as string[]
    for (const file of fileList) {
      const name = join(currentDir, file)
      if ((await stat(name)).isDirectory()) {
        await getFiles(name)
      } else {
        files.push(name)
      }
    }
  }
  await getFiles(dir)
  return files
}

// https://vitejs.dev/config/
export default defineConfig(async () => {
  let entrys = await listFiles(resolve(__dirname, 'src'))
  entrys = entrys
    .filter((e) => e)
    .filter((e) => {
      return extname(e)
    })
  console.log('entrys', entrys)
  return {
    plugins: [
      // dts({ tsconfigPath: resolve(__dirname, './tsconfig.dts.json'), rollupTypes: true }),
      vue(),
      vueJsx()
    ],
    publicDir: false,
    resolve: {
      alias: {
        '@': resolve(__dirname, './src')
      }
    },
    build: {
      minify: false,
      sourcemap: true,
      target: 'esnext',
      lib: {
        entry: entrys,
        formats: ['cjs']
        // fileName: (format) => {
        //   if (format == 'cjs') {
        //     return 'index.cjs'
        //   }
        //   if (format == 'es') {
        //     return 'index.js'
        //   }
        //   return `index.${format}.js`
        // }
      },
      rollupOptions: {
        external: generateExternal(),
        output: {
          dir: resolve(__dirname, 'dist'),
          preserveModules: true,
          preserveModulesRoot: resolve(__dirname, 'src')
        }
      }
    }
  }
})