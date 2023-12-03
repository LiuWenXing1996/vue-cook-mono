import type { JsonTypeObject } from '@/utils/jsonType'
import type { IViewContext } from '..'

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

export type IJsFunction<R, P extends any[]> = (ctx: IViewContext, params: P) => R

export const defineJsFunction = <R, P extends any[]>(value: IJsFunction<R, P>) => value

export interface ILogicComposerActionSchema extends IActionSchemaBase {
  type: 'LogicComposer'
  content: JsonTypeObject
}
