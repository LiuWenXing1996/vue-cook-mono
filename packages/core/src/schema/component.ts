import { resolveDepVar, type IDep } from '@/utils/fetchDeps'
import type { IDeps } from '..'
import type { JsonType, JsonTypeObject } from '@/utils/jsonType'
import type { IRenderMode } from '@/render'
import type { ISchemaData } from '@/design-mode/design-renderer-context'
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

export interface IAttributeDataBase {
  type: string
  value: any
}

export type IAttributeData =
  IAttributeActionData |
  IAttributeStringData |
  IAttributeStateData |
  IAttributeNumberData |
  IAttributeBooleanData |
  IAttributeI18nData |
  IAttributeJsonData |
  IAttributeObjectData

export interface IAttributeActionData extends IAttributeDataBase {
  type: "action"
  value: string
}

export interface IAttributeStateData extends IAttributeDataBase {
  type: "state"
  value: string
}

export interface IAttributeStringData extends IAttributeDataBase {
  type: "string"
  value: string
}

export interface IAttributeNumberData extends IAttributeDataBase {
  type: "number"
  value: number
}

export interface IAttributeBooleanData extends IAttributeDataBase {
  type: "boolean"
  value: boolean
}

export interface IAttributeI18nData extends IAttributeDataBase {
  type: "i18n"
  value: {
    [langKey: string]: string
  }
}

export interface IAttributeJsonData extends IAttributeDataBase {
  type: "json"
  value: JsonTypeObject
}

export interface IAttributeObjectData extends IAttributeDataBase {
  type: "object"
  value: {
    [dataKey: string]: IAttributeData
  }
}


export interface ITemplateConfig {
  text?: string
  tag?: string
  attributes?: Record<string, IAttributeData>
  slots?: Record<string, ITemplateConfig[]>
  events?: Record<string, string[]>
}

export interface IComponentConfig {
  name: string
  template?: ITemplateConfig[]
  style?: string
  states?: Record<string, string>
  props?: Record<string, unknown>
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

export interface ITemplateConfigWithPid extends ITemplateConfig {
  __designPid: string
  slots?: Record<string, ITemplateConfigWithPid[]>
}
export interface IComponentConfigWithTemplatePid extends IComponentConfig {
  template?: ITemplateConfigWithPid[]
}

export const appendTemplatePid = (template: ITemplateConfig[]): ITemplateConfigWithPid[] => {
  const appendMultiTemplatePid = (
    multiTemplate: ITemplateConfig[],
    parentDesignPid: string
  ): ITemplateConfigWithPid[] => {
    return multiTemplate.map((tpl, index) => {
      const tag = (tpl.text ? '#text' : tpl.tag) || 'unknown-tag'
      const __designPid = `${parentDesignPid}__${index}__${tag}`
      const _tpl = {
        ...tpl,
        __designPid,
        slots: appendSlotsPid(tpl.slots, __designPid)
      }
      return _tpl as ITemplateConfigWithPid
    })
  }
  const appendSlotsPid = (
    slots: ITemplateConfig['slots'],
    parentDesignPid: string
  ): ITemplateConfigWithPid['slots'] => {
    if (!slots) {
      return
    }
    const _slots: ITemplateConfigWithPid['slots'] = {}
    Object.keys(slots).map((key) => {
      const _tpl = slots[key]
      _slots[key] = appendMultiTemplatePid(_tpl, `${parentDesignPid}__${key}`)
    })
    return _slots
  }

  const _tpl: ITemplateConfigWithPid[] = appendMultiTemplatePid(template, '#root')

  return _tpl
}

export const removeTemplatePid = (template: ITemplateConfigWithPid[]): ITemplateConfig[] => {
  const removeMultiTemplatePid = (multiTemplate: ITemplateConfigWithPid[]): ITemplateConfig[] => {
    return multiTemplate.map((tpl, index) => {
      const tag = (tpl.text ? '#text' : tpl.tag) || 'unknown-tag'
      const _tpl = {
        ...tpl,
        __designPid: undefined,
        slots: removeSlotsPid(tpl.slots)
      }
      return _tpl as ITemplateConfig
    })
  }
  const removeSlotsPid = (slots: ITemplateConfigWithPid['slots']): ITemplateConfig['slots'] => {
    if (!slots) {
      return
    }
    const _slots: ITemplateConfig['slots'] = {}
    Object.keys(slots).map((key) => {
      const _tpl = slots[key]
      _slots[key] = removeMultiTemplatePid(_tpl)
    })
    return _slots
  }

  const _tpl: ITemplateConfig[] = removeMultiTemplatePid(template)

  return _tpl
}