import { resolve } from 'node:path'
import { remove } from 'fs-extra'
import { build } from 'vite'
import {
  createFsUtils,
  path,
  ElementDataCoreLibOnceGetterIdIdKey,
  ElementDataLowcodeContextIdKey,
  type ICookConfig,
  fillConfig
} from '@vue-cook/core'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { getOutDir, getTempDir, resolveConfig, resolvePkgJson } from '@/utils'
import fsPromises from 'node:fs/promises'

const { outputFile } = createFsUtils(fsPromises)

export interface IBuildDepsOptions {
  configPath: string
  pkgJsonPath: string
  __dirname: string
}

const pkgNameNormalize = (name: string) => {
  return name.replaceAll('/', '+')
}

const buildDeps = async (options: IBuildDepsOptions) => {
  const { configPath, pkgJsonPath } = options
  const _cookConfig = await resolveConfig(configPath)
  if (!_cookConfig) {
    return
  }
  const cookConfig = fillConfig(_cookConfig)
  const pkgJson = await resolvePkgJson(pkgJsonPath)
  if (!pkgJson) {
    return
  }
  let { dependencies = {} } = pkgJson
  // dependencies = { "@vue-cook/core": '3.0.0' }
  const a = getOutDir(cookConfig)
  console.log(a)
  const outDir = resolve(getOutDir(cookConfig), './deps')
  const tempDir = resolve(getTempDir(cookConfig), './deps')
  const depEntryList = Object.keys(dependencies).map((depName) => {
    return {
      name: depName,
      version: dependencies[depName],
      path: resolve(tempDir, './libs', `./${pkgNameNormalize(depName)}.ts`),
      content:
        cookConfig.deps.find((e) => e.name === depName)?.entry ||
        `
export * from "${depName}"; 
`
    }
  })
  await remove(tempDir)
  await Promise.all(
    depEntryList.map(async (depEntry) => {
      await outputFile(depEntry.path, depEntry.content)
    })
  )
  console.log('buildDeps')

  const depsEntryCss = {
    path: resolve(tempDir, `./index.css`),
    content: '/* deps css content */'
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
    realtivePath = path.trimExtname(realtivePath, ['.ts', '.js'])
    return `import * as Lib${index} from "${realtivePath}"`
  })
  .join('\n')}

const libs = {
${depEntryList
  .map((dep, index) => {
    return `  ["${dep.name}"]:Lib${index}`
  })
  .join(',\n')}
}

exportDeps(libs)
`
  await outputFile(depsEntryJs.path, depsEntryJs.content)

  await build({
    publicDir: false,
    plugins: [nodePolyfills()],
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
        external: cookConfig.deps.map((e) => e.name).concat('@vue-cook/core'),
        output: {
          banner: `(function(){
${cookConfig.deps
  .filter((e) => e.external)
  .map((e) => {
    return `var ${e.external}`
  })
  .join(';\n')}
var VueCookCore;
(function(){
  var script = document.currentScript
  var contextUid = script.dataset.${ElementDataLowcodeContextIdKey}
  var coreLibGetterUid = script.dataset.${ElementDataCoreLibOnceGetterIdIdKey}
  VueCookCore = window[coreLibGetterUid]()
  var context = VueCookCore.getLowcodeContext(contextUid)
  var externalLibs = context.getExternalLibs()
  ${cookConfig.deps
    .filter((e) => e.external)
    .map((e) => {
      return `  ${e.external} = externalLibs["${e.name}"]`
    })
    .join(';\n')}
}());

`,
          footer: `
}())`,
          globals: (name) => {
            if (name === '@vue-cook/core') {
              return 'VueCookCore'
            }
            return cookConfig.deps.find((e) => e.name === name)?.external || ''
          }
        }
      }
    }
  })

  return true
}

export default buildDeps
