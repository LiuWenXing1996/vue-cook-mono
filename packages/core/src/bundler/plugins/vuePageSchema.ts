import type { IPlugin } from '..'
import { name as schemaToCodeName } from './schemaToCode'
import type { ISchemaToCodeApi } from './schemaToCode'

import { type IPageConfig, check, transformPage, transformPageEntryTs } from '../../schema/page'

export const vuePageSchema = (): IPlugin => {
  return {
    name: 'vuePageSchema',
    bundleStart: async (options, helper) => {
      const cookConfig = helper.getCookConfig()
      const { join, relative } = helper.getPathUtils()
      const vfs = helper.getVirtualFileSystem()
      const plugins = helper.getPlugins()
      const schemaToCodePlugin = plugins?.find?.((e) => e.name === schemaToCodeName)
      if (schemaToCodePlugin?.api) {
        const schemaToCodePluginApi = schemaToCodePlugin?.api as ISchemaToCodeApi
        schemaToCodePluginApi.registerSchemaParser({
          name: 'vuePage',
          configName: cookConfig.page?.configName || 'page.config.yaml',
          check: async (filePath) => {
            const config = await vfs.readYaml<IPageConfig>(filePath)
            check(config)
            return true
          },
          transfer: async (filePath) => {
            const config = await vfs.readYaml<IPageConfig>(filePath)
            const vueFile = {
              path: '',
              content: ''
            }
            vueFile.path = join(filePath, '../', 'index.vue')
            vueFile.content = transformPage(config)
            await vfs.outputFile(vueFile.path, vueFile.content)

            const entryTsFile = {
              path: '',
              content: ''
            }
            entryTsFile.path = join(filePath, '../', cookConfig?.page?.entryName || 'index.ts')
            const realtiveVuePath = './' + relative(entryTsFile.path + '/../', vueFile.path)
            entryTsFile.content = transformPageEntryTs({
              config,
              indexVuePath: realtiveVuePath
            })
            await vfs.outputFile(entryTsFile.path, entryTsFile.content)
          }
        })
      }
    }
  }
}
