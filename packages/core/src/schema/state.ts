import type { JsonTypeArray, JsonTypeObject } from '@/utils/jsonType'

export type IState = IStringState | INumberState | IBooleanState | IJsonState

export interface IStateBase {
  name: string
  type: string
}

export interface IStringState extends IStateBase {
  name: string
  type: 'String'
  content: string
}
export interface INumberState extends IStateBase {
  name: string
  type: 'Number'
  content: number
}
export interface IBooleanState extends IStateBase {
  name: string
  type: 'Boolean'
  content: boolean
}
export interface IJsonState extends IStateBase {
  name: string
  type: 'Json'
  content: JsonTypeObject | JsonTypeArray
}
