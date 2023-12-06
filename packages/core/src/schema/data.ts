import type { JsonTypeObject } from '@/utils/jsonType'

export interface IBaseDataSchema {
  type: string
  content: any
}

export interface IDataMapSchema {
  [dataName: string]: IDataSchema
}

export type IDataSchema =
  | IActionDataSchema
  | IStringDataSchema
  | IStateDataSchema
  | INumberDataSchema
  | IBooleanDataSchema
  | II18nDataSchema
  | IJsonDataSchema
  | IObjectDataSchema

export interface IActionDataSchema extends IBaseDataSchema {
  type: 'action'
  content: string
}

export interface IStateDataSchema extends IBaseDataSchema {
  type: 'state'
  content: string
}

export interface IStringDataSchema extends IBaseDataSchema {
  type: 'string'
  content: string
}

export interface INumberDataSchema extends IBaseDataSchema {
  type: 'number'
  content: number
}

export interface IBooleanDataSchema extends IBaseDataSchema {
  type: 'boolean'
  content: boolean
}

export interface II18nDataSchema extends IBaseDataSchema {
  type: 'i18n'
  content: string
}

export interface IJsonDataSchema extends IBaseDataSchema {
  type: 'json'
  content: JsonTypeObject
}

export interface IObjectDataSchema extends IBaseDataSchema {
  type: 'object'
  content: {
    [dataKey: string]: IDataSchema
  }
}
