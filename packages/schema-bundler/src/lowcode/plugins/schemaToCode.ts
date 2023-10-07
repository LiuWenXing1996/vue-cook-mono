import type { IPlugin } from '@/bundler/build'
import type { IVirtulFileSystem } from '@/index'
import { path, type ICookConfig, type IDeepRequiredCookConfig } from '@vue-cook/core'

export interface ISchemaParserCheckOptions {
  filePath: string
  vfs: IVirtulFileSystem
  cookConfig: IDeepRequiredCookConfig
}

export interface ISchemaParserTransferOptions {
  filePath: string
  vfs: IVirtulFileSystem
  cookConfig: IDeepRequiredCookConfig
}

export interface ISchemaParser {
  name: string
  configName: string
  check: (options: ISchemaParserCheckOptions) => boolean | Promise<boolean>
  transfer: (options: ISchemaParserTransferOptions) => void | Promise<void>
}

export const createSchemaToCodePlugin = (options: { cookConfig: IDeepRequiredCookConfig }) => {
  const { cookConfig } = options
  const schemaParserList: ISchemaParser[] = []
  const registerSchemaParser = (parser: ISchemaParser) => {
    if (schemaParserList.find((e) => e.name === parser.name)) {
      throw new Error(`${parser.name} 已存在`)
    }
    if (schemaParserList.find((e) => e.configName === parser.configName)) {
      throw new Error(`${parser.configName} 已存在`)
    }
    schemaParserList.push(parser)
  }
  const findSchemaParser = (filePath: string) => {
    const _baseName = path.basename(filePath)
    const schemaParseMap = new Map<string, ISchemaParser>()
    schemaParserList.map((e) => {
      schemaParseMap.set(e.configName, { ...e })
    })
    return schemaParseMap.get(_baseName)
  }
  const plugin: IPlugin = {
    name: 'schemaToCode',
    bundleStart: async (options, helper) => {
      const vfs = helper.getVirtualFileSystem()
      const allFiles = await vfs.listFiles()
      await Promise.all(
        allFiles.map(async (filePath) => {
          const parser = findSchemaParser(filePath)
          if (parser) {
            await parser.check({ filePath, vfs, cookConfig })
            await parser.transfer({ filePath, vfs, cookConfig })
          }
        })
      )
    }
  }

  return {
    plugin,
    registerSchemaParser,
    findSchemaParser
  }
}

export const defineSchemaParser = (schemaParser: ISchemaParser) => schemaParser
