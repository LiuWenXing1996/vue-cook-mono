import { relative, resolve } from 'node:path'
import { outputFile, remove } from 'fs-extra'
import * as FsPromises from 'node:fs/promises'
import { build, type InlineConfig } from 'vite'
import {
  createFsUtils,
  path,
  fillConfig,
  type IPkgJson,
  type IDeepRequiredCookConfig,
  type ICookConfig,
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
import { build as schemaBundler, transform as schemaToCode } from '@vue-cook/schema-bundler'

export interface IBuildDepsOptions {
  configPath: string
  pkgJsonPath: string
}

export const transform = async (options: {
  cookConfig: IDeepRequiredCookConfig
  packageJson: IPkgJson
  outDir: string
  tempDir: string
}) => {
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

  const codeVfs = await schemaToCode({ vfs })
  const realFs = createFsUtils(FsPromises)
  await realFs.copyFromFs('/', codeVfs, resolve(root, './dist'))
}

const transformToCode = async (options: IBuildDepsOptions) => {
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

  await transform({
    cookConfig,
    packageJson,
    outDir: resolve(outDir, './deps'),
    tempDir: resolve(tempDir, './deps')
  })
}

export default transformToCode
