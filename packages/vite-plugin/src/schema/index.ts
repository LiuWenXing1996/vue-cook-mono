import { readFile } from 'fs/promises'
import { Plugin } from 'vite'
import path from 'node:path'
import { getFiles } from '../utils'

export interface IOptions {
  pkgJsonPath: string
  cookConfigPath: string
}

export interface IPkgJson {
  dependencies: Record<string, string>
}

const resovePkgJson = async (pkgJsonPath: string) => {
  const absolutePath = path.resolve(pkgJsonPath)
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
}

const resoveConfig = async (cookConfigPath: string) => {
  const absolutePath = path.resolve(cookConfigPath)
  let content: ICookConfig | undefined = undefined
  try {
    const contentString = await readFile(absolutePath, 'utf-8')
    content = JSON.parse(contentString) as ICookConfig
  } catch (e) {}
  return content
}

const autoDepsPlugin = (options: IOptions): Plugin => {
  const { pkgJsonPath, cookConfigPath } = options
  const virtualModuleId = 'vue-cook:lowcode-schema'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'vue-cook-lowcode', // 必须的，将会在 warning 和 error 中显示
    resolveId: (id: string) => {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
      return
    },
    load: async (id: string) => {
      if (id === resolvedVirtualModuleId) {
        const { dependencies = {} } = (await resovePkgJson(pkgJsonPath)) || {}
        const cookConfig = await resoveConfig(cookConfigPath)
        if (!cookConfig) {
          return ''
        }
        const { entry, ignorePaths } = cookConfig
        // 读取项目文件
        const content = getFiles(path.resolve('.'), ignorePaths)
        console.log(content)
        const libs = `// import { run } from "@vue-cook/core"
// inject libs
export default {}`
        console.log(libs)
        return libs
      }
      return
    }
  }
}

export default autoDepsPlugin
