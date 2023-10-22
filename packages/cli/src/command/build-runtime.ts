import { resolve } from 'node:path'
import { remove } from 'fs-extra'
import { build } from 'vite'
import {
  createFsUtils,
  path,
  ElementDataCoreLibOnceGetterIdIdKey,
  fillConfig,
  type IPkgJson,
  type IDeepRequiredCookConfig
} from '@vue-cook/core'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { collectDepMetaList, getOutDir, getTempDir, resolveConfig, resolvePkgJson } from '@/utils'
import fsPromises from 'node:fs/promises'

const { outputFile } = createFsUtils(fsPromises)

export interface IBuildDepsOptions {
  configPath: string
  pkgJsonPath: string
}

const pkgNameNormalize = (name: string) => {
  return name.replaceAll('/', '+')
}

const buildRuntimeDeps = async (options: {
  cookConfig: IDeepRequiredCookConfig
  packageJson: IPkgJson
  outDir: string
  tempDir: string
}) => {
  const { cookConfig, packageJson, outDir, tempDir } = options
  const deps = await collectDepMetaList(cookConfig, packageJson)
  const depEntryList = deps.map((dep) => {
    const cookMeta = dep.cookMeta
    return {
      name: dep.name,
      version: dep.version,
      path: resolve(tempDir, './libs', `./${pkgNameNormalize(dep.name)}.ts`),
      content:
        cookMeta?.runtimeEntry?.import ||
        `
import * as Lib from "${dep.name}";
export * from "${dep.name}";
const defaultValue = Lib.default||{}
export default defaultValue
  `,
      metaPath: resolve(tempDir, './libs', `./${pkgNameNormalize(dep.name)}.meta.json`),
      metaContent: JSON.stringify(dep, null, 2)
    }
  })

  await remove(tempDir)
  await Promise.all(
    depEntryList.map(async (depEntry) => {
      await outputFile(depEntry.path, depEntry.content)
      await outputFile(depEntry.metaPath, depEntry.metaContent)
    })
  )
  console.log('buildDesign')

  const depsEntryCss = {
    path: resolve(tempDir, `./index.css`),
    content: `/* deps css content */`
  }

  await outputFile(depsEntryCss.path, depsEntryCss.content)

  const depsEntryJs = {
    path: '',
    content: ''
  }
  depsEntryJs.path = resolve(tempDir, `./deps-entry.ts`)
  depsEntryJs.content = `
  import { exportDeps } from "@vue-cook/core"
  import "./index.css"

  ${depEntryList
    .map((dep, index) => {
      let realtivePath = './' + path.relative(path.dirname(depsEntryJs.path), dep.path)
      let realtiveMetaPath = './' + path.relative(path.dirname(depsEntryJs.path), dep.metaPath)
      realtivePath = path.trimExtname(realtivePath, ['.ts', '.js'])
      return `
import * as Lib${index} from "${realtivePath}"
import Lib${index}Meta from "${realtiveMetaPath}"
      `
    })
    .join('\n')}

  const deps = new Map();
  ${depEntryList
    .map((dep, index) => {
      return `deps.set("${dep.name}",{
    value:Lib${index},
    meta:Lib${index}Meta
  });`
    })
    .join('\n')}

  exportDeps({deps,targetWindow:window})
  `
  await outputFile(depsEntryJs.path, depsEntryJs.content)

  await build({
    publicDir: false,
    plugins: [nodeResolve(), commonjs(), nodePolyfills()],
    build: {
      minify: false,
      outDir: outDir,
      sourcemap: cookConfig.sourcemap,
      lib: {
        entry: depsEntryJs.path,
        name: 'deps',
        formats: ['iife'],
        fileName: () => {
          return 'index.js'
        }
      },
      rollupOptions: {
        external: ['@vue-cook/core'],
        output: {
          banner: `(function(){
  var VueCookCore;
  (function(){
    var script = document.currentScript
    var coreLibGetterUid = script.dataset.${ElementDataCoreLibOnceGetterIdIdKey}
    VueCookCore = window[coreLibGetterUid]()
  }());

  `,
          footer: `
  }())`,
          globals: (name) => {
            if (name === '@vue-cook/core') {
              return 'VueCookCore'
            }
            return ''
          }
        }
      }
    }
  })
}

const buildRuntime = async (options: IBuildDepsOptions) => {
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

  const outDir = resolve(getOutDir(cookConfig), './runtime')
  const tempDir = resolve(getTempDir(cookConfig), './runtime')
  await remove(tempDir)

  await buildRuntimeDeps({
    cookConfig,
    packageJson,
    outDir: resolve(outDir, './deps'),
    tempDir: resolve(tempDir, './deps')
  })
  // TODO:build schema ,build auto
}

export default buildRuntime
