import { readFile } from 'fs/promises'
import { Plugin } from 'vite'
import path from 'node:path'

export interface IOptions {
  pkgJsonPath: string
  cookConfigPath: string,
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

const autoDepsPlugin = (options: IOptions): Plugin => {
  const { pkgJsonPath, cookConfigPath } = options
  const virtualModuleId = 'virtual:vue-cook-lowcode'
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
        const cookConfig = ""
        if (!cookConfig) {
          return ''
        }
        const { entry, output } = cookConfig
        const moduleList = Object.keys(dependencies).map((key, index) => {
          return {
            varName: `Lib${index}`,
            moduleName: key
          }
        })
        const libs = `// import { run } from "@vue-cook/core"
// inject libs
${moduleList
  .map(e => {
    return ` // import * as ${e.varName} from '${e.moduleName}'`
  })
  .join('\n')}

const libs = {
    ${moduleList
      .map(e => {
        return `['${e.moduleName}']: ${e.varName}`
      })
      .join(',\n')}
}

// const A = await run({
//   entryJs: './lowcode/index.js',
//   libs: libs
// })

export default A;`
        console.log(libs)
        return libs
      }
      return
    }
  }
}

export default autoDepsPlugin
