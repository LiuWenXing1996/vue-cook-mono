import path, { resolve } from 'node:path'
import genVueScriptContent from '../utils/genVueScriptContent'
import { name } from '../../package.json'
import {
  creatBuildContext,
  IBuildOptions
} from '../buildContext/createBuildContext'
// @ts-ignore
import { getCustomComsole } from '@vue-cook/shared'
import { findAllComponentPaths } from '../utils/findAllComponentPaths'
import { exit } from 'node:process'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'url'
import { build } from 'vite'
import type { Plugin } from 'vite'
import { isArray } from 'lodash'
import { rollup, RollupOutput } from 'rollup'
import { outputFile } from 'fs-extra'
import * as babel from '@babel/core'

const { log } = getCustomComsole(name)

export interface IBuildDepsOptions {
  configPath: string
  pkgJsonPath: string
  __dirname: string
}

export interface IPkgJson {
  dependencies: Record<string, string>
}

export const resolvePkgJson = async (pkgJsonPath: string) => {
  const absolutePath = resolve(pkgJsonPath)
  let content: IPkgJson | undefined = undefined
  try {
    const contentString = await readFile(absolutePath, 'utf-8')
    content = JSON.parse(contentString) as IPkgJson
  } catch (e) {}
  return content
}

export interface ICookConfig {
  version: string
  ignorePaths: string[]
  entry: string
  components: string
  rootPath: string
  deps: Record<string, { entry?: string }>
}

export const resolveConfig = async (cookConfigPath: string) => {
  const absolutePath = resolve(cookConfigPath)
  let content: ICookConfig | undefined = undefined
  try {
    const contentString = await readFile(absolutePath, 'utf-8')
    content = JSON.parse(contentString) as ICookConfig
  } catch (e) {}
  return content
}

const autoDepPlugin = (options: {
  depName: string
  virtualModuleId: string
  entry?: string
}): Plugin => {
  const { depName, virtualModuleId, entry } = options
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'vue-cook-dep', // 必须的，将会在 warning 和 error 中显示
    resolveId: (id: string) => {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
      return
    },
    load: async (id: string) => {
      if (id === resolvedVirtualModuleId) {
        const lib = entry || `export {uniq} from "${depName}"`
        console.log(lib)
        return lib
      }
      return
    }
  }
}

const buildDeps = async (options: IBuildDepsOptions) => {
  const { configPath, pkgJsonPath, __dirname } = options
  const config = await resolveConfig(configPath)
  if (!config) {
    return
  }
  const pkgJson = await resolvePkgJson(pkgJsonPath)
  if (!pkgJson) {
    return ''
  }
  let { dependencies = {} } = pkgJson
  const dependencieList = Object.keys(dependencies)
  dependencies = { 'lodash': '3.0.0' }
  const outputFiles: Record<string, string> = {}

  await Promise.all(
    Object.keys(dependencies).map(async dep => {
      const virtualModuleId = resolve(
        __dirname,
        `./${dep.replaceAll('/', '+')}.ts`
      )
      console.log(virtualModuleId)
      // TODO:构建顺序
      // TODO:lodash这种包的构建导出其实是有问题的，没有转成真正的esm
      // TODO:如果只支持应用呢？会不会容易些？
      /**
       * vite   ===》 esm
       *
       */
      const viteOutput = await build({
        configFile: false,
        root: resolve(__dirname, '.'),
        plugins: [
          autoDepPlugin({
            depName: dep,
            virtualModuleId,
            entry: config.deps[dep]?.entry
          })
        ],
        build: {
          write: false,
          target: 'es2015',
          lib: {
            entry: virtualModuleId,
            fileName: () => {
              return 'index.js'
            },
            formats: ['cjs'],
            name: dep
          },
          outDir: resolve(__dirname, `./dist/deps/${dep.replaceAll('/', '+')}`),
          cssCodeSplit: false,
          rollupOptions: {
            external: dependencieList.filter(e => e !== dep)
          },
          minify: false
        }
      })
      let viteOutputList = isArray(viteOutput)
        ? [...viteOutput]
        : ([viteOutput] as RollupOutput[])

      viteOutputList.map(rollupOutput => {
        const { output } = rollupOutput
        output.map(e => {
          const fileName = `./dist/deps/${dep.replaceAll('/', '+')}/${
            e.fileName
          }`
          // @ts-ignore
          outputFiles[fileName] = e.code
        })
      })
    })
  )

  console.log(Object.keys(outputFiles))
  // // babel转译下
  // await Promise.all(
  //   Object.keys(outputFiles)
  //     .filter(e => {
  //       if (e.endsWith('.js')) {
  //         return true
  //       }
  //       return false
  //     })
  //     .map(async key => {
  //       const bundle = babel.transform(outputFiles[key], {
  //         babelrc: false,
  //         configFile: false,
  //         presets: [['@babel/preset-env']],
  //         caller: {
  //           name: 'my-custom-tool',
  //           supportsStaticESM: true
  //         }
  //         // sourceMaps: true,
  //         // inputSourceMap: JSON.parse(outputFiles[key + '.map'] || '{}')
  //       })
  //       outputFiles[key] = bundle?.code || ''
  //       //@ts-ignore
  //       // outputFiles[key + '.map'] = JSON.stringify(bundle.map || '')
  //     })
  // )

  await Promise.all(
    Object.keys(outputFiles || {}).map(async key => {
      await outputFile(key, outputFiles?.[key] || '')
    })
  )

  return true
}

export default buildDeps
