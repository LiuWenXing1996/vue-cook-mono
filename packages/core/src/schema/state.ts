import type { JsonTypeArray, JsonTypeObject } from '@/utils/jsonType'

export type IStateSchema = IStringState | INumberState | IBooleanState | IJsonState

export interface IStateSchemaBase {
  name: string
  type: string
}

export interface IStringState extends IStateSchemaBase {
  name: string
  type: 'String'
  content: string
}
export interface INumberState extends IStateSchemaBase {
  name: string
  type: 'Number'
  content: number
}
export interface IBooleanState extends IStateSchemaBase {
  name: string
  type: 'Boolean'
  content: boolean
}
export interface IJsonState extends IStateSchemaBase {
  name: string
  type: 'Json'
  content: JsonTypeObject | JsonTypeArray
}
