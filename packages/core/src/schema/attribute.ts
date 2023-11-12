import type { JsonTypeObject } from '@/utils/jsonType'

export interface IBaseAttributeSchema {
  type: string
  name: string
  content: any
}

export type IAttributeSchema =
  | IActionAttributeSchema
  | IStringAttributeSchema
  | IStateAttributeSchema
  | INumberAttributeSchema
  | IBooleanAttributeSchema
  | II18nAttributeSchema
  | IJsonAttributeSchema
  | IObjectAttributeSchema

export interface IActionAttributeSchema extends IBaseAttributeSchema {
  type: 'action'
  content: string
}

export interface IStateAttributeSchema extends IBaseAttributeSchema {
  type: 'state'
  content: string
}

export interface IStringAttributeSchema extends IBaseAttributeSchema {
  type: 'string'
  content: string
}

export interface INumberAttributeSchema extends IBaseAttributeSchema {
  type: 'number'
  content: number
}

export interface IBooleanAttributeSchema extends IBaseAttributeSchema {
  type: 'boolean'
  content: boolean
}

export interface II18nAttributeSchema extends IBaseAttributeSchema {
  type: 'i18n'
  content: string
}

export interface IJsonAttributeSchema extends IBaseAttributeSchema {
  type: 'json'
  content: JsonTypeObject
}

export interface IObjectAttributeSchema extends IBaseAttributeSchema {
  type: 'object'
  content: {
    [dataKey: string]: IAttributeSchema
  }
}
