import {
  type IPageSchemaConfig,
  pageSchemaCheck,
  pageSchemaTransfer,
  transformPageEntryTs,
  path
} from '@vue-cook/core'
import { defineSchemaParser } from '../plugins/schemaToCode'

export const vuePageSchemaParser = defineSchemaParser({
  name: 'vuePage',
  configName: 'page.config.yaml',
  check: async (options) => {
    const { filePath, vfs } = options
    const config = await vfs.readYaml<IPageSchemaConfig>(filePath)
    pageSchemaCheck(config)
    return true
  },
  transfer: async (options) => {
    const { filePath, vfs } = options
    const config = await vfs.readYaml<IPageSchemaConfig>(filePath)
    const vueFile = {
      path: '',
      content: ''
    }
    vueFile.path = path.join(filePath, '../', 'index.vue')
    vueFile.content = pageSchemaTransfer(config)
    await vfs.outputFile(vueFile.path, vueFile.content)

    const entryTsFile = {
      path: '',
      content: ''
    }
    entryTsFile.path = path.join(filePath, '../', 'index.ts')
    const realtiveVuePath = './' + path.relative(entryTsFile.path + '/../', vueFile.path)
    entryTsFile.content = transformPageEntryTs({
      config,
      indexVuePath: realtiveVuePath
    })
    await vfs.outputFile(entryTsFile.path, entryTsFile.content)
  }
})
