import type { IImportSchema } from './import'
import { pascalCase } from 'pascal-case'

export interface IAliasComponentSchemaBase {
  tag: string
  type: string
  path: string
}

export interface IDestructuringAliasComponentSchema extends IAliasComponentSchemaBase {
  type: 'destructuring'
  exportName?: string
}

export interface IDefaultAliasComponentSchemaa extends IAliasComponentSchemaBase {
  type: 'default'
}

export type IAliasComponentSchema =
  | IDestructuringAliasComponentSchema
  | IDefaultAliasComponentSchemaa

export const aliasComponentSchemaToImportSchemaMap: Record<
  IAliasComponentSchema['type'],
  ((schema: IAliasComponentSchema) => IImportSchema | undefined) | undefined
> = {
  destructuring: (schema) => {
    if (schema.type === 'destructuring') {
      const tagName = pascalCase(schema.tag)
      const exportName = schema.exportName || tagName
      const aliasName = tagName !== exportName ? tagName : undefined
      return {
        path: schema.path,
        type: 'destructuring',
        names: [
          {
            aliasName: aliasName,
            exportName: exportName
          }
        ]
      }
    }
  },
  default: (schema) => {
    if (schema.type === 'default') {
      return {
        path: schema.path,
        type: 'default',
        name: pascalCase(schema.tag)
      }
    }
  }
}

export const aliasComponentSchemaToImportSchema = (schema: IAliasComponentSchema) => {
  const toSchema = aliasComponentSchemaToImportSchemaMap[schema.type]
  const content = toSchema?.(schema)
  return content
}

export const aliasComponentSchemasToImportSchemas = (schemaList: IAliasComponentSchema[]) => {
  return schemaList
    ?.map((e) => {
      return aliasComponentSchemaToImportSchema(e)
    })
    .filter((e) => e) as IImportSchema[]
}
