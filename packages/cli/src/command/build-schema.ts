import  { join, relative, resolve } from 'node:path'
import { name } from '../../package.json'
import { readFile } from 'node:fs/promises'
import { emptyDir, outputFile } from 'fs-extra'
import { build } from '@vue-cook/core'
import type { ICookConfig } from '@vue-cook/core'
import type { Plugin } from 'vite'
import * as esbuild from 'esbuild'
import * as swc from '@swc/core'
import { getFielsContent, getFiles } from '../utils'
import { getCustomComsole } from '../utils/customComsole'
import VueCompiler from '@vue/compiler-sfc'

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
        const lib = entry || `export * from "${depName}"`
        return lib
      }
      return
    }
  }
}

const buildSchema = async (options: IBuildDepsOptions) => {
  const { configPath, pkgJsonPath, __dirname } = options
  const config = await resolveConfig(configPath)
  if (!config) {
    return
  }
  const pkgJson = await resolvePkgJson(pkgJsonPath)
  if (!pkgJson) {
    return
  }
  const { ignorePaths } = config
  // 读取项目文件
  const files = await getFiles(resolve(__dirname, '.'), ignorePaths)
  // console.log(files)
  const fielsContent = await getFielsContent(files)
  // console.log('fielsContent', fielsContent)
  const modules: Record<string, string> = {}
  fielsContent.map(e => {
    const _path = relative(resolve(__dirname, '.'), e.path)
    modules[_path] = e.content
  })
  const res = await build({
    env: 'node',
    files: modules,
    esbuild,
    plugins: [
      {
        name: 'logVfs',
        enforce: 'post',
        bundleStart: async (options, helper) => {
          const vfs = helper.getVirtualFileSystem()
          const files = (await vfs.readAllFiles()) || {}
          const tempLogFile = resolve(__dirname, './node_modules/.vfs-temp')
          await emptyDir(tempLogFile)
          await Promise.all(
            Object.keys(files).map(async key => {
              const _path = resolve(tempLogFile, key)
              await outputFile(_path, files[key] || '')
            })
          )
          console.log('虚拟文件: ' + tempLogFile)
        }
      }
    ],
    swc,
    vueCompiler: VueCompiler
  })

  await Promise.all(
    Object.keys(res || {}).map(async key => {
      await outputFile(key, res?.[key] || '')
    })
  )

  return res
}

export default buildSchema
