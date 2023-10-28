import { resolveDepVar, type IDep } from '@/utils/fetchDeps'
import type { IDeps } from '..'
import type { JsonType, JsonTypeObject } from '@/utils/jsonType'
import type { IRenderMode } from '@/render'
import type { ISchemaData } from '@/design-mode/render'
import { resolve } from '@/utils/path'

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
  states?: Record<string, string>
  components?: Record<
    string,
    {
      innerComponentPath?: string
      packageName?: string
      varName?: string
    }
  >
}

export interface InnerComponent {
  isInnerComponent: true
  schema: IComponentConfig
}
export interface OutterComponent<T> {
  isInnerComponent: false
  component: T
}

export type IComponentMap<T> = Map<string, InnerComponent | OutterComponent<T>>
export type IStateMap = Map<string, unknown>

export const getComponetMap = <T>(params: { deps?: IDeps; data?: ISchemaData }) => {
  const { data, deps } = params
  if (!data) {
    return
  }
  const { componentList, mainPath } = data
  const mainComponent = componentList.find((e) => e.path === mainPath)
  if (!mainComponent) {
    return
  }
  const { value: mainComponentConfig } = mainComponent
  const { components = {} } = mainComponentConfig

  const componentMap: IComponentMap<T> = new Map()
  Object.entries(components).map(([key, value]) => {
    const { innerComponentPath, packageName, varName } = value
    if (innerComponentPath) {
      const absoulteInnerComponentPath = resolve(mainPath, innerComponentPath)
      const config = componentList.find((e) => e.path === absoulteInnerComponentPath)
      if (config?.value) {
        componentMap.set(key, {
          isInnerComponent: true,
          schema: config.value
        })
      }
    } else {
      if (packageName && varName) {
        const lib = deps?.get(packageName)
        const cmpt = resolveDepVar<T>({ dep: lib, varName })
        if (cmpt) {
          componentMap.set(key, {
            isInnerComponent: false,
            component: cmpt
          })
        }
      }
    }
  })
  return componentMap
}

export const getStateMap = (params: { deps?: IDeps; data?: ISchemaData }) => {
  const { data, deps } = params
  if (!data) {
    return
  }
  const { componentList, mainPath } = data
  const mainComponent = componentList.find((e) => e.path === mainPath)
  if (!mainComponent) {
    return
  }
  const { value: mainComponentConfig } = mainComponent
  const map: IStateMap = new Map()
  const { states = {} } = mainComponentConfig || {}
  const genVarGetter = (code: string) => {
    const func = new Function(`return (states)=>${code}`)
    return func.call(window) as (states: Record<string, unknown>) => unknown
  }
  const s = new Proxy({} as Record<string, unknown>, {
    get: (target, prop) => {
      const config = states[prop as string]
      const gettter = genVarGetter(config)
      return gettter(target)
    }
  })
  Object.entries(states).map(([key, value]) => {
    map.set(key, s[value])
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
