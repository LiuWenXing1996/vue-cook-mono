import { resolve } from 'node:path'
import { outputFile, remove } from 'fs-extra'
import { build, type InlineConfig } from 'vite'
import {
  createFsUtils,
  path,
  ElementDataCoreLibOnceGetterIdIdKey,
  fillConfig,
  type IPkgJson,
  type IDeepRequiredCookConfig,
  type ICookConfig,
  ElementDataLowcodeContextIdKey
} from '@vue-cook/core'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { collectDepMetaList, getOutDir, getTempDir, resolveConfig, resolvePkgJson } from '@/utils'
import { genDepsEntryJs } from '@/utils/gen-deps-entry-js'
import { getBuildConfig } from '@/utils/get-build-config'

export interface IBuildDepsOptions {
  configPath: string
  pkgJsonPath: string
}


// TODO:buildSchema 实现
export const buildSchema = async (options: IBuildDepsOptions) => {
  
}

/**
 * dev
 *    - schema
 *    - deps
 *        - design
 *        - runtime
 *            - none-external
 *            - embed-a
 *            - embed-b
 *            - ...
 *    - auto
 */
const buildDevDeps = async (options: {
  cookConfig: IDeepRequiredCookConfig
  packageJson: IPkgJson
  outDir: string
  tempDir: string
}) => {
  const { cookConfig, packageJson, outDir, tempDir } = options
  const depMetaList = await collectDepMetaList(cookConfig, packageJson)

  const depsEntryJsMap = {
    design: await genDepsEntryJs({ mode: 'design', tempDir, depMetaList: depMetaList }),
    runtime: await genDepsEntryJs({ mode: 'runtime', tempDir, depMetaList: depMetaList })
  }

  const buildConfigList = [
    getBuildConfig({
      cookConfig,
      externals: [],
      entry: depsEntryJsMap.design.path,
      outDir: resolve(outDir, 'design')
    }),
    getBuildConfig({
      cookConfig,
      externals: [],
      entry: depsEntryJsMap.design.path,
      outDir: resolve(outDir, './runtime/none-external')
    }),
    ...cookConfig.embed.map((e) => {
      return getBuildConfig({
        cookConfig,
        externals: e.externals,
        entry: depsEntryJsMap.design.path,
        outDir: resolve(outDir, `./runtime/embed-${e.name}`)
      })
    })
  ]

  await Promise.all(
    buildConfigList.map(async (e) => {
      await build(e)
    })
  )
}

const buildAuto = async (options: {
  cookConfig: IDeepRequiredCookConfig
  outDir: string
  tempDir: string
}) => {
  const { cookConfig, outDir, tempDir } = options

  await remove(tempDir)

  const autoEntryCss = {
    path: resolve(tempDir, `./index.css`),
    content: `/* auto css content */`
  }

  const autoEntryJs = {
    path: '',
    content: ''
  }
  autoEntryJs.path = resolve(tempDir, `./entry.ts`)
  // TODO:此处的autoRunVueApp有问题
  autoEntryJs.content = `
import { autoRunVueApp, path } from '@vue-cook/core'
import "./index.css"

const script = document.currentScript as HTMLScriptElement
const scriptUrl = new URL(script?.src,location.href)

const genAbsoulteUrl = (url: string) => {
  const newUrl =  new URL(url,scriptUrl)
  return newUrl.toString()
}

autoRunVueApp({
  depsEntryList: [genAbsoulteUrl('../deps/index.js'), genAbsoulteUrl('../deps/style.css')],
  schemaEntryList: [genAbsoulteUrl('../schema/index.js'), genAbsoulteUrl('../schema/index.css')],
  mountedEl:"#app"
}).then((res)=>{console.log("res",res)})
`
  await outputFile(autoEntryJs.path, autoEntryJs.content)
  await outputFile(autoEntryCss.path, autoEntryCss.content)

  await build({
    publicDir: false,
    plugins: [nodeResolve(), commonjs(), nodePolyfills()],
    build: {
      minify: false,
      outDir: outDir,
      sourcemap: cookConfig.sourcemap,
      lib: {
        entry: autoEntryJs.path,
        name: 'auto',
        formats: ['iife'],
        fileName: () => {
          return 'index.js'
        }
      }
    }
  })

  return true
}

const buildDev = async (options: IBuildDepsOptions) => {
  const { configPath, pkgJsonPath } = options
  const _cookConfig = await resolveConfig(configPath)
  if (!_cookConfig) {
    return
  }
  const cookConfig = fillConfig(_cookConfig)
  const packageJson = await resolvePkgJson(pkgJsonPath)
  if (!packageJson) {
    return
  }

  const outDir = resolve(getOutDir(cookConfig), './dev')
  const tempDir = resolve(getTempDir(cookConfig), './dev')
  await remove(tempDir)
  await remove(outDir)

  await buildDevDeps({
    cookConfig,
    packageJson,
    outDir: resolve(outDir, './deps'),
    tempDir: resolve(tempDir, './deps')
  })
  await buildAuto({
    cookConfig,
    outDir: resolve(outDir, './auto'),
    tempDir: resolve(tempDir, './auto')
  })
}

export default buildDev
