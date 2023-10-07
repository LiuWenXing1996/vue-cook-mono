import {
  type IComponentSchemaConfig,
  componentSchemaCheck,
  componentSchemaTransfer,
  transformComponentEntryTs,
  path
} from '@vue-cook/core'
import { defineSchemaParser } from '../plugins/schemaToCode'

export const vueComponentSchemaParser = defineSchemaParser({
  name: 'vueComponent',
  configName: 'component.config.yaml',
  check: async (options) => {
    const { filePath, vfs } = options
    const config = await vfs.readYaml<IComponentSchemaConfig>(filePath)
    componentSchemaCheck(config)
    return true
  },
  transfer: async (options) => {
    const { filePath, vfs } = options
    const config = await vfs.readYaml<IComponentSchemaConfig>(filePath)
    const vueFile = {
      path: '',
      content: ''
    }
    vueFile.path = path.join(filePath, '../', 'index.vue')
    vueFile.content = componentSchemaTransfer(config)
    await vfs.outputFile(vueFile.path, vueFile.content)

    const entryTsFile = {
      path: '',
      content: ''
    }
    entryTsFile.path = path.join(filePath, '../', 'index.ts')
    const realtiveVuePath = './' + path.relative(entryTsFile.path + '/../', vueFile.path)
    entryTsFile.content = transformComponentEntryTs({
      config,
      indexVuePath: realtiveVuePath
    })
    await vfs.outputFile(entryTsFile.path, entryTsFile.content)
  }
})
