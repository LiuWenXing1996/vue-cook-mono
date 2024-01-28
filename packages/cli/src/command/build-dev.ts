import { relative, resolve } from 'node:path'
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
  ElementDataLowcodeContextIdKey,
  createVfs
} from '@vue-cook/core'
import * as esbuild from 'esbuild'
import * as swc from '@swc/core'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import {
  collectDepMetaList,
  getFielsContent,
  getOutDir,
  getTempDir,
  resolveConfig,
  resolvePkgJson
} from '@/utils'
import { genDepsEntryJs } from '@/utils/gen-deps-entry-js'
import { getBuildConfig } from '@/utils/get-build-config'
import { build as schemaBundler } from '@vue-cook/schema-bundler'

export interface IBuildDepsOptions {
  configPath: string
  pkgJsonPath: string
}

export const buildSchema = async (options: {
  cookConfig: IDeepRequiredCookConfig
  packageJson: IPkgJson
  outDir: string
  tempDir: string
}) => {
  const start = Date.now()
  const { cookConfig, packageJson, outDir, tempDir } = options
  const { ignorePaths } = cookConfig
  const root = resolve(process.cwd(), '.')
  const { globby } = await import('globby')
  const files = await globby(['**/*'], {
    cwd: root,
    gitignore: true,
    ignore: ignorePaths
  })
  // console.log('files', files)
  const fielsContent = await getFielsContent(files)
  // console.log(fielsContent)
  const modules: Record<string, string> = {}
  fielsContent.map((e) => {
    const _path = resolve('/', relative(root, e.path))
    modules[_path] = e.content
  })
  const vfs = createVfs()
  await Promise.all(
    Object.keys(modules).map(async (filePath) => {
      await vfs.outputFile(filePath, modules[filePath])
    })
  )

  const res = await schemaBundler({ vfs, esbuild, swc })
  await Promise.all([
    (async () => {
      console.log('...')
      const path = resolve(outDir, './index.js')
      await outputFile(path, res?.js || '')
    })(),
    (async () => {
      const path = resolve(outDir, './index.css')
      await outputFile(path, res?.css || '')
    })()
  ])
  const end = Date.now()
  console.log('schema build interval', end - start)
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
  autoEntryJs.content = `
import { autoCreateRenderer, path } from '@vue-cook/core'
import "./index.css"
autoCreateRenderer({
  depsEntry: {
    js:"../deps/design/index.js",
    css:"../deps/design/style.css"
  },
  bundleDataEntry:{
    jsUrl:"../schema/index.js",
    cssUrl:"../schema/index.css"
  },
})
`
  await outputFile(autoEntryJs.path, autoEntryJs.content)
  await outputFile(autoEntryCss.path, autoEntryCss.content)

  await build({
    publicDir: false,
    plugins: [ nodePolyfills()],
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

  await buildSchema({
    cookConfig,
    packageJson,
    outDir: resolve(outDir, './schema'),
    tempDir: resolve(tempDir, './schema')
  })
}

export default buildDev
