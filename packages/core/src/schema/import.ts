import { uniqBy } from 'lodash'
export interface IImportSchemaBase {
  path: string
  type: string
}

export interface ISideEffectImportSchema extends IImportSchemaBase {
  type: 'sideEffect'
}

export interface IDestructuringImportSchema extends IImportSchemaBase {
  type: 'destructuring'
  names: {
    aliasName?: string
    exportName: string
  }[]
}

export interface IDefaultImportSchema extends IImportSchemaBase {
  type: 'default'
  name: string
}

export interface IAllImportSchema extends IImportSchemaBase {
  type: 'all'
  name: string
}

export type IImportSchema =
  | ISideEffectImportSchema
  | IDestructuringImportSchema
  | IDefaultImportSchema
  | IDefaultImportSchema
  | IAllImportSchema

export const importSchemaToCodeMap: Record<
  IImportSchema['type'],
  ((schema: IImportSchema) => string) | undefined
> = {
  sideEffect: (schema) => {
    let content = ''
    if (schema.type === 'sideEffect') {
      return `import "${schema.path}"`
    }
    return content
  },
  destructuring: (schema) => {
    let content = ''
    if (schema.type === 'destructuring') {
      return `import {${schema.names
        .map((name) => {
          return `${name.exportName}${name.aliasName ? ` ${name.aliasName}` : ''}`
        })
        .join(',\n')}} from "${schema.path}"`
    }
    return content
  },
  default: (schema) => {
    let content = ''
    if (schema.type === 'default') {
      return `import ${schema.name} from "${schema.path}"`
    }
    return content
  },
  all: (schema) => {
    let content = ''
    if (schema.type === 'all') {
      return `import * as ${schema.name} from "${schema.path}"`
    }
    return content
  }
}

export const importSchemaToCode = (schema: IImportSchema) => {
  const toCode = importSchemaToCodeMap[schema.type]
  const content = toCode?.(schema) || ''
  return content
}

export const genUniqKey = (schema: IImportSchema) => {
  return `${schema.type}__${schema.path}`
}

export const uniqSchemaList = (schemaList: IImportSchema[]) => {
  let newSchemaMap: Record<string, IImportSchema | undefined> = {}
  schemaList.forEach((schema) => {
    const uniqKey = genUniqKey(schema)
    const newSchema = newSchemaMap[uniqKey] || schema
    if (newSchema.type === 'destructuring' && schema.type === 'destructuring') {
      newSchema.names = [...newSchema.names, ...schema.names]
      newSchema.names = uniqBy(newSchema.names, (e) => {
        return `${e.aliasName}_${e.exportName}`
      })
    }
    newSchemaMap[uniqKey] = newSchema
  })
  return Object.values(newSchemaMap).filter((e) => e) as IImportSchema[]
}

export const importSchemaListToCode = (schemaList: IImportSchema[]) => {
  const uniqedSchemaList = uniqSchemaList(schemaList)
  const content = uniqedSchemaList
    .map((schema) => {
      return importSchemaToCode(schema)
    })
    .filter((e) => e)
    .join(';\n')
  return content
}
