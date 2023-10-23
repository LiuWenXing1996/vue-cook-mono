import type { IDep } from '@/utils/fetchDeps'
import type { IDeps } from '..'
import type { JsonType, JsonTypeObject } from '@/utils/jsonType'
import type { IRenderMode } from '@/render'

export interface IComponentType extends JsonTypeObject {
  name: string
  packageName: string
}

export const getComponentTypeUniName = (type: IComponentType) => {
  return `${type.packageName}-${type.name}`
}

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
  {
    editorType: IEditorType
    value: JsonType
  }
>

export interface ITemplateConfig extends JsonTypeObject {
  type?: IComponentType
  text?: string
  attributes?: ITemplateAttributes
  slots?: Record<string, ITemplateConfig[]>
  events?: Record<string, string[]>
}

export interface IComponentConfig {
  name: string
  template: ITemplateConfig[]
  style: string
  data: Record<string, string>
}

export interface IView<T = any> {
  type: IComponentType
  makeComponent: (mode: IRenderMode) => T
}

export interface IViewWithDep<T = any> {
  view: IView<T>
  dep: IDep
}

export const defineView = <T = any>(view: IView<T>) => view

export const createViewManager = (deps: IDeps) => {
  
}

export const getViewList = <T = any>(options: { deps: IDeps }) => {
  const { deps } = options
  const list: IViewWithDep<T>[] = []
  Array.from(deps?.values() || []).map((dep) => {
    const viewsVarName = dep.meta.cookMeta?.viewsVarName
    if (!viewsVarName) {
      return
    }
    const viewsVar = dep.value?.[viewsVarName] as IView<T>[] | undefined
    if (!viewsVar) {
      return
    }
    viewsVar.forEach((view) => {
      list.push({
        view,
        dep
      })
    })
  })
  return list
}
