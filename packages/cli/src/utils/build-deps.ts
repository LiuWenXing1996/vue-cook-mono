import { resolve } from 'node:path'
import { remove } from 'fs-extra'
import { build } from 'vite'
import {
  createFsUtils,
  path,
  ElementDataCoreLibOnceGetterIdIdKey,
  ElementDataLowcodeContextIdKey,
  type ICookConfig,
  fillConfig,
  type IDeepRequiredCookConfig,
  type IPkgJson
} from '@vue-cook/core'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { genDepEntryList, getOutDir, getTempDir, resolveConfig, resolvePkgJson } from '@/utils'
import fsPromises from 'node:fs/promises'

const { outputFile } = createFsUtils(fsPromises)

const buildDeps = async (cookConfig: IDeepRequiredCookConfig, pkgJson: IPkgJson) => {
  let { dependencies = {} } = pkgJson
  // dependencies = { "@vue-cook/core": '3.0.0' }
  const outDir = resolve(getOutDir(cookConfig), './deps')
  const tempDir = resolve(getTempDir(cookConfig), './deps')
  const depEntryList = genDepEntryList({
    tempDir,
    dependencies,
    deps: cookConfig.deps
  })
  await remove(tempDir)
  await Promise.all(
    depEntryList.map(async (depEntry) => {
      await outputFile(depEntry.path, depEntry.content)
    })
  )
  console.log('buildDeps')

  const depsEntryJs = {
    path: '',
    content: ''
  }
  depsEntryJs.path = resolve(tempDir, `./deps-entry.ts`)
  depsEntryJs.content = `
import { exportDeps } from "@vue-cook/core"

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
  .filter((e) => e.injectName)
  .map((e) => {
    return `var ${e.injectName}`
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
    .filter((e) => e.injectName)
    .map((e) => {
      return `  ${e.injectName} = externalLibs["${e.name}"]`
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
            return cookConfig.deps.find((e) => e.name === name)?.injectName || ''
          }
        }
      }
    }
  })

  return true
}

export default buildDeps
