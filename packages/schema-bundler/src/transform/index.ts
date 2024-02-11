import { createVfs, type IVirtulFileSystem } from '../utils/fs'
import {
  contextSchemaToCode,
  getCookConfigFromFs,
  getPkgJsonFromFs,
  getViewFilesFromFs,
  getViewSchemaFilePathListFromFs,
  path,
  templateSchemaParser,
  templateSchemaToTsxTemplate,
  viewSchemaParser,
  viewSchemaToCode,
  exportSchemaToCode
} from '@vue-cook/core'
export const transform = async (params: { vfs: IVirtulFileSystem }) => {
  const { vfs: orginVfs } = params
  const vfs = createVfs()
  await vfs.copyFromFs('/', orginVfs)
  const viewSchemaFilePathList = await getViewSchemaFilePathListFromFs(vfs)
  const viewSchemaFiles = await Promise.all(
    viewSchemaFilePathList.map(async (filePath) => {
      const viewSchemaString = await vfs.readFile(filePath, 'utf-8')
      const viewSchema = await viewSchemaParser(viewSchemaString)
      return {
        path: filePath,
        schema: viewSchema
      }
    })
  )
  await Promise.all(
    viewSchemaFiles.map(async ({ path: filePath, schema: viewSchema }) => {
      const codeFileList = await viewSchemaToCode(viewSchema)
      await Promise.all(
        codeFileList.map(async (codeFile) => {
          const absolutePath = path.join(path.dirname(filePath), codeFile.path)
          await vfs.outputFile(absolutePath, codeFile.content)
        })
      )
    })
  )
  const exportCodeList = await exportSchemaToCode(
    {},
    {
      targetPath: '/src',
      viewSchemaFiles: viewSchemaFiles
    }
  )

  await Promise.all(
    exportCodeList.map(async (codeFile) => {
      await vfs.outputFile(codeFile.path, codeFile.content)
    })
  )

  return vfs
}
