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
  viewSchemaParser
} from '@vue-cook/core'
export const transform = async (params: { vfs: IVirtulFileSystem }) => {
  const { vfs: orginVfs } = params
  const vfs = createVfs()
  await vfs.copyFromFs('/', orginVfs)
  const viewSchemaFilePathList = await getViewSchemaFilePathListFromFs(vfs)
  await Promise.all(
    viewSchemaFilePathList.map(async (filePath) => {
      const viewSchemaString = await vfs.readFile(filePath, 'utf-8')
      const viewSchema = await viewSchemaParser(viewSchemaString)
      const contextFile = {
        content: await contextSchemaToCode(viewSchema.context),
        path: path.join(path.dirname(filePath), './context.ts')
      }
      await vfs.outputFile(contextFile.path, contextFile.content)
    })
  )

  return vfs
}
