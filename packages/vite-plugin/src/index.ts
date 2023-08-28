import { Plugin } from 'vite'
import {
  getFielsContent,
  getFiles,
  resolveConfig,
  resolvePkgJson
} from './utils'
import { resolve } from 'node:path'
import {
  creatBuildContext,
  cunstomBuild
} from './buildContext/createBuildContext'
import * as esbuild from 'esbuild'
export interface IOptions {
  pkgJsonPath: string
  cookConfigPath: string
}

const plugin = (options: IOptions): Plugin => {
  const { cookConfigPath, pkgJsonPath } = options
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
        const cookConfig = await resolveConfig(cookConfigPath)
        if (!cookConfig) {
          return ''
        }
        const pkgJson = await resolvePkgJson(pkgJsonPath)
        if (!pkgJson) {
          return ''
        }
        const { ignorePaths } = cookConfig
        // 读取项目文件
        const files = await getFiles(resolve('.'), ignorePaths)
        // console.log(files)
        const fielsContent = await getFielsContent(files)
        // console.log('fielsContent', fielsContent)
        const modules: Record<string, string> = {}
        fielsContent.map(e => {
          modules[e.path] = e.content
        })
        const result = await cunstomBuild(esbuild, {
          config: cookConfig,
          pkgJson: pkgJson,
          modules
        })

        console.log("result",result)
        // let result = await buildContext?.rebuild()
        let res = result?.outputFiles?.[0].text || ''
        const a = `
        const a = \`${res}\`;
        export default a
        `
        return a

        // return res
      }
      return
    }
  }
}

export default plugin
