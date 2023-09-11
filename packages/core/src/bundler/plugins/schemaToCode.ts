import { IPlugin } from '..'

export interface ISchemaParser {
  name: string
  configName: string
  check: (filePath: string) => boolean | Promise<boolean>
  transfer: (filePath: string) => void | Promise<void>
}

export interface ISchemaToCodeApi {
  registerSchemaParser: (parser: ISchemaParser) => void
}

export const name = 'schemaToCode'

export const schemaToCode = (): IPlugin => {
  const schemaParserList: ISchemaParser[] = []
  const registerSchemaParser = (parser: ISchemaParser) => {
    if (schemaParserList.find(e => e.name === parser.name)) {
      throw new Error(`${parser.name} 已存在`)
    }
    if (schemaParserList.find(e => e.configName === parser.configName)) {
      throw new Error(`${parser.configName} 已存在`)
    }
    schemaParserList.push(parser)
  }
  return {
    name: name,
    enforce: 'post',
    api: {
      registerSchemaParser
    },
    bundleStart: async (options, helper) => {
      const { basename } = helper.getPathUtils()
      const vfs = helper.getVirtualFileSystem()
      const schemaParseMap = new Map<string, ISchemaParser>()
      schemaParserList.map(e => {
        schemaParseMap.set(e.configName, { ...e })
      })
      const allFiles = await vfs.readAllFiles()
      for (const filePath in allFiles) {
        if (Object.prototype.hasOwnProperty.call(allFiles, filePath)) {
          const _baseName = basename(filePath)
          const parser = schemaParseMap.get(_baseName)
          if (parser) {
            await parser.check(filePath)
            await parser.transfer(filePath)
          }
        }
      }
    }
  }
}
