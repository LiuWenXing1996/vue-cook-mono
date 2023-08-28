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
// import type { Plugin } from 'vite'
import { isArray } from 'lodash'
import { rollup, RollupOutput } from 'rollup'
import { outputFile, remove } from 'fs-extra'
import * as babel from '@babel/core'
import * as esbuild from 'esbuild'
import { type Plugin } from 'esbuild'
import * as swc from '@swc/core'
import type { ICookConfig } from '@vue-cook/core'
import { defineMethodName } from '@vue-cook/core'

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

// export interface ICookConfig {
//   version: string
//   ignorePaths: string[]
//   entry: string
//   components: string
//   rootPath: string
//   deps: Record<string, { entry?: string }>
// }

export const resolveConfig = async (cookConfigPath: string) => {
  const absolutePath = resolve(cookConfigPath)
  let content: ICookConfig | undefined = undefined
  try {
    const contentString = await readFile(absolutePath, 'utf-8')
    content = JSON.parse(contentString) as ICookConfig
  } catch (e) {}
  return content
}

// const autoDepPlugin = (options: {
//   depName: string
//   virtualModuleId: string
//   entry?: string
// }): Plugin => {
//   const { depName, virtualModuleId, entry } = options
//   const resolvedVirtualModuleId = '\0' + virtualModuleId

//   return {
//     name: 'vue-cook-dep', // 必须的，将会在 warning 和 error 中显示
//     resolveId: (id: string) => {
//       if (id === virtualModuleId) {
//         return resolvedVirtualModuleId
//       }
//       return
//     },
//     load: async (id: string) => {
//       if (id === resolvedVirtualModuleId) {
//         const lib = entry || `export {uniq} from "${depName}"`
//         console.log(lib)
//         return lib
//       }
//       return
//     }
//   }
// }

export const VirtualPlugin = (options: Record<string, string> = {}) => {
  const namespace = 'virtual'
  const filter = new RegExp(
    Object.keys(options)
      .map(name => `^${name}$`)
      .join('|')
  )
  const plugin: Plugin = {
    name: namespace,
    setup (build) {
      build.onResolve({ filter }, args => {
        // debugger
        return {
          path: args.path,
          namespace
        }
      })
      build.onLoad({ filter: /.*/, namespace }, args => {
        return {
          contents: options[args.path],
          loader: 'js',
          resolveDir: resolve(__dirname)
        }
      })
    }
  }
  return plugin
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
  // dependencies = { vue: '3.0.0' }
  const tempDir = resolve(__dirname, './vue-cook-temp')
  const depEntryList = Object.keys(dependencies).map(depName => {
    return {
      name: depName,
      version: dependencies[depName],
      path: resolve(tempDir, `./${depName.replaceAll('/', '+')}.ts`),
      outDir: resolve(__dirname, './dist',`./deps/${depName.replaceAll('/', '+')}`),
      content:
        config.deps?.[depName]?.entry ||
        `
export * from "${depName}"; 
export {default} from "${depName}"; 
`
    }
  })
  await remove(tempDir)
  await Promise.all(
    depEntryList.map(async depEntry => {
      await outputFile(depEntry.path, depEntry.content)
    })
  )
  const outputFiles: Record<string, string> = {}

  await Promise.all(
    depEntryList.map(async depEntry => {
      // TODO: gen entry file
      let bundleRes = await esbuild.build({
        // entryPoints: [resolve(__dirname, `./container.ts`)],
        entryPoints: [depEntry.path],
        bundle: true,
        target: ['es2015'],
        format: 'esm',
        write: false,
        external: dependencieList.filter(e => e !== depEntry.name),
        sourcemap: true,
        outdir: depEntry.outDir
      })

      {
        ;(bundleRes.outputFiles || []).map(e => {
          outputFiles[e.path] = e.text
        })
      }
    })
  )


  await Promise.all(
    Object.keys(outputFiles)
      .filter(e => {
        if (e.endsWith('.js')) {
          return true
        }
        return false
      })
      .map(async key => {
        const bundle = await swc.transform(outputFiles[key], {
          module: {
            type: 'amd'
          },
          sourceMaps: 'inline',
          inputSourceMap: outputFiles[key + '.map'] || '{}'
        })
        outputFiles[key] = bundle.code || ''
        //@ts-ignore
        outputFiles[key + '.map'] = JSON.stringify(bundle.map || '')
      })
  )

  await Promise.all([
    ...Object.keys(outputFiles)
      .filter(e => {
        if (e.endsWith('.js')) {
          return true
        }
        return false
      })
      .map(async key => {
        const minifyRes = await esbuild.transform(outputFiles[key], {
          loader: 'js',
          // minify: true,
          sourcemap: true,
          banner: `(function () {
var define = window['${defineMethodName}']`,
          footer: '})();'
        })
        outputFiles[key] =
          minifyRes.code + `//# sourceMappingURL=` + 'index.js.map'
        outputFiles[key + '.map'] = minifyRes.map
      }),
    ...Object.keys(outputFiles)
      .filter(e => {
        if (e.endsWith('.css')) {
          return true
        }
        return false
      })
      .map(async key => {
        // TODO:css的source map 似乎不太对
        const minifyRes = await esbuild.transform(outputFiles[key], {
          loader: 'css',
          minify: true,
          sourcemap: true
        })
        outputFiles[key] = minifyRes.code
        outputFiles[key + '.map'] = minifyRes.map
      })
  ])

  console.log('outputFiles', Object.keys(outputFiles))

  await Promise.all(
    Object.keys(outputFiles || {}).map(async key => {
      await outputFile(key, outputFiles?.[key] || '')
    })
  )

  return true
}

export default buildDeps
