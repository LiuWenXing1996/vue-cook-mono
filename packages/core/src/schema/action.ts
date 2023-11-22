import type { JsonTypeObject } from '@/utils/jsonType'

export type IActionSchema = IJsFunctionActionSchema | ILogicComposerActionSchema

export interface IActionSchemaBase {
  name: string
  type: string
}

export interface IJsFunctionActionSchema extends IActionSchemaBase {
  type: 'JsFunction'
  jsPath: string
  varName: string
}

export interface ILogicComposerActionSchema extends IActionSchemaBase {
  type: 'LogicComposer'
  content: JsonTypeObject
}
