import { type IPlugin, defineMethodName } from '..'
import { name as schemaToCodeName } from './schemaToCode'
import type { ISchemaToCodeApi } from './schemaToCode'
import { type IExportConfig, check, transfer } from '../../schema/export'

export const exportSchema = (): IPlugin => {
  return {
    name: 'exportSchema',
    bundleStart: async (options, helper) => {
      const cookConfig = helper.getCookConfig()
      const { join } = helper.getPathUtils()
      const vfs = helper.getVirtualFileSystem()
      const plugins = helper.getPlugins()
      const schemaToCodePlugin = plugins?.find?.(
        e => e.name === schemaToCodeName
      )
      if (schemaToCodePlugin?.api) {
        const schemaToCodePluginApi =
          schemaToCodePlugin?.api as ISchemaToCodeApi
        schemaToCodePluginApi.registerSchemaParser({
          name: 'export',
          configName: cookConfig.export?.configName || 'export.config.json',
          check: async filePath => {
            const config = await vfs.readJson<IExportConfig>(filePath)
            check(config)
            return true
          },
          transfer: async filePath => {
            const config = await vfs.readJson<IExportConfig>(filePath)
            const entryTsPath = join(
              cookConfig.root,
              cookConfig?.export?.entryName || 'index.ts'
            )
            const content = transfer(config, entryTsPath)
            await vfs.outputFile(entryTsPath, content)
          }
        })
      }
    }
  }
}
