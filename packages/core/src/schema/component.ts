import { resolveDepVar, type IDep } from '@/utils/fetchDeps'
import type { IDeps } from '..'
import type { JsonType, JsonTypeObject } from '@/utils/jsonType'
import type { IRenderMode } from '@/render'

export interface IEditorType extends JsonTypeObject {
  name: string
  packageName: string
}

export const getEditorTypeUniName = (type: IEditorType) => {
  return `${type.packageName}-${type.name}`
}

export interface IEditor<V extends JsonType = JsonType, R = any> {
  type: IEditorType
  transfer: (value: V) => R
}

export type ITemplateAttributes = Record<
  string,
  | {
      isVar: false
      value: string
    }
  | { isVar: true; value: JsonType }
>

export interface ITemplateConfig {
  text?: string
  tag?: string
  attributes?: ITemplateAttributes
  slots?: Record<string, ITemplateConfig[]>
  events?: Record<string, string[]>
}

export interface IComponentConfig {
  name: string
  template?: ITemplateConfig[]
  style?: string
  data?: Record<string, string>
  components?: Record<
    string,
    {
      packageName: string
      varName: string
    }
  >
}

export const getComponetMap = <T>(params: { deps?: IDeps; componentConfig?: IComponentConfig }) => {
  const { deps, componentConfig } = params
  const map = new Map<string, T>()
  const { components = {} } = componentConfig || {}
  Object.entries(components).map(([key, value]) => {
    const lib = deps?.get(value.packageName)
    const cmpt = resolveDepVar<T>({ dep: lib, varName: value.varName })
    if (cmpt) {
      map.set(key, cmpt)
    }
  })
  return map
}

export interface IView<T = any> {
  makeComponent: (mode: IRenderMode) => T
}

export interface IViewWithDep<T = any> {
  view: IView<T>
  dep: IDep
}
