import {
  type IExportSchemaConfig,
  exportSchemaCheck,
  exportSchemaTransfer,
  path
} from '@vue-cook/core'
import { defineSchemaParser } from '../plugins/schemaToCode'

export const exportSchemaParser = defineSchemaParser({
  name: 'export',
  configName: 'export.config.json',
  check: async (options) => {
    const { filePath, vfs } = options
    const config = await vfs.readJson<IExportSchemaConfig>(filePath)
    exportSchemaCheck(config)
    return true
  },
  transfer: async (options) => {
    const { filePath, vfs, cookConfig } = options
    const config = await vfs.readJson<IExportSchemaConfig>(filePath)
    const entryTsPath = path.join(cookConfig.root, 'index.ts')
    const content = exportSchemaTransfer(config, entryTsPath)
    await vfs.outputFile(entryTsPath, content)
  }
})
