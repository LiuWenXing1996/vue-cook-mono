import { type IPlugin, defineMethodName } from '..'
import { name as schemaToCodeName } from './schemaToCode'
import type { ISchemaToCodeApi } from './schemaToCode'

import {
  type IComponentConfig,
  check,
  transformComponent,
  transformComponentEntryTs
} from '../../schema/component'

export const vueComponentSchema = (): IPlugin => {
  return {
    name: 'vueComponentSchema',
    bundleStart: async (options, helper) => {
      const cookConfig = helper.getCookConfig()
      const { join, relative } = helper.getPathUtils()
      const vfs = helper.getVirtualFileSystem()
      const plugins = helper.getPlugins()
      const schemaToCodePlugin = plugins?.find?.((e) => e.name === schemaToCodeName)
      if (schemaToCodePlugin?.api) {
        const schemaToCodePluginApi = schemaToCodePlugin?.api as ISchemaToCodeApi
        schemaToCodePluginApi.registerSchemaParser({
          name: 'vueComponent',
          configName: cookConfig.component?.configName || 'component.config.yaml',
          check: async (filePath) => {
            const config = await vfs.readYaml<IComponentConfig>(filePath)
            check(config)
            return true
          },
          transfer: async (filePath) => {
            const config = await vfs.readYaml<IComponentConfig>(filePath)
            const vueFile = {
              path: '',
              content: ''
            }
            vueFile.path = join(filePath, '../', 'index.vue')
            vueFile.content = transformComponent(config)
            await vfs.outputFile(vueFile.path, vueFile.content)

            const entryTsFile = {
              path: '',
              content: ''
            }
            entryTsFile.path = join(filePath, '../', cookConfig?.component?.entryName || 'index.ts')
            const realtiveVuePath = './' + relative(entryTsFile.path + '/../', vueFile.path)
            entryTsFile.content = transformComponentEntryTs({
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
