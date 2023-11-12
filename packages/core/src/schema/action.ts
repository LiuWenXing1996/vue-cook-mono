import type { JsonTypeObject } from '@/utils/jsonType'

export type IAction = IJsFunctionAction | ILogicComposerAction

export interface IActionBase {
  name: string
  type: string
}

export interface IJsFunctionAction extends IActionBase {
  name: string
  type: 'JsFunction'
  jsPath: string
  varName: string
}

export interface ILogicComposerAction extends IActionBase {
  name: string
  type: 'LogicComposer'
  content: JsonTypeObject
}
