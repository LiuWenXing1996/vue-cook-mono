import type { ICodeFile } from '@/utils'
import { importSchemaListToCode, type IImportSchema } from './import'
import type { IViewSchema } from './view'
import { relative, dirname, join } from '@/utils/path'
import { groupBy } from 'lodash'

export interface IExportSchema {
  imports?: IImportSchema[]
  exports?: IExportItemSchema[]
}

export interface IExportItemSchema {
  category: string
  name: string
  importName: string
}

export const exportSchemaToCode = async (
  exportSchema: IExportSchema,
  options?: {
    viewSchemaFiles?: {
      path: string
      schema: IViewSchema
    }[]
    targetPath?: string
  }
): Promise<ICodeFile[]> => {
  const { viewSchemaFiles = [], targetPath } = options || {}
  const { imports = [], exports = [] } = exportSchema

  const indexCssFile: ICodeFile = {
    path: `./index.css`,
    content: `/* schema css content */`
  }
  indexCssFile.path = targetPath ? join(targetPath, indexCssFile.path) : indexCssFile.path

  const viewsEntryTsFile: ICodeFile = {
    content: '',
    path: './views.ts'
  }
  viewsEntryTsFile.path = targetPath
    ? join(targetPath, viewsEntryTsFile.path)
    : viewsEntryTsFile.path
  viewsEntryTsFile.content = `
import { useAppMountFunc } from "@vue-cook/render";
${viewSchemaFiles
  .map((viewSchemaFile, index) => {
    let realtivePath = './' + relative(dirname(viewsEntryTsFile.path), dirname(viewSchemaFile.path))
    return `import View${index} from "${realtivePath}"`
  })
  .join('\n;')}
  
const designViews = {
${viewSchemaFiles
  .map((viewSchemaFile, index) => {
    return `"${viewSchemaFile.path}":View${index}`
  })
  .join('\n,')}
}
const pages = [
  ${viewSchemaFiles
    .map((viewSchemaFile, index) => {
      if (viewSchemaFile.schema.type === 'page') {
        return `View${index}`
      }
      return ``
    })
    .filter((e) => e)
    .join('\n,')}
]
export const getDesignViews = () => {
  return { ...designViews }
}
export const getPages = () => {
  return [...pages]
}
export const mountApp = useAppMountFunc({pages})
`

  const indexTsFile: ICodeFile = {
    path: `./index.ts`,
    content: ``
  }
  indexTsFile.path = targetPath ? join(targetPath, indexTsFile.path) : indexTsFile.path
  const categorys = groupBy(exports, (e) => e.category)
  indexTsFile.content = `
import "./index.css"
${importSchemaListToCode(imports)}
export * from "./views"

export default {
  ${Object.keys(categorys)
    .map((categoryName) => {
      const items = categorys[categoryName]
      return `"${categoryName}":{
        ${items.map((item) => {
          return `"${item.name}":${item.name}`
        })}
    }`
    })
    .join('\n,')}
}
`

  return [indexTsFile, indexCssFile, viewsEntryTsFile]
}
