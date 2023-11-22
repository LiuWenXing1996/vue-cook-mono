import {
  type IAttributeSchemaData,
  type IComponentConfigWithTemplatePid,
  type IComponentMap,
  type IStateSchemaMap
} from '@/schema/component'
import { type IDeps } from '@/utils/fetchDeps'
import type { IDesignComponentOverlay, ISchemaData } from './design-renderer-context'

const internalToExternalMap = new WeakMap<InternalDesignRenderer, AbstractDesignRenderer>()
const externalToInternalMap = new WeakMap<AbstractDesignRenderer, InternalDesignRenderer>()

export const getInternalDesignRenderer = <Component>(
  renderer: AbstractDesignRenderer<Component>
) => {
  return externalToInternalMap.get(renderer) as InternalDesignRenderer<Component>
}

export const getDesignRenderer = <Component>(renderer: InternalDesignRenderer<Component>) => {
  return internalToExternalMap.get(renderer) as AbstractDesignRenderer<Component>
}

class InternalDesignRenderer<Component = any> {
  designRendererData?: IDesignRendererData<Component>
  deps?: IDeps
  designRendererDataListenerList: IDesignRendererDataChangeListener<Component>[]
  constructor() {
    this.designRendererDataListenerList = []
  }
}

export abstract class AbstractDesignRenderer<Component = any> {
  #actionMap: Map<string, Function>
  #stateMap: Map<string, any>
  #locale: string
  constructor() {
    const internalDesignRenderer = new InternalDesignRenderer()
    internalToExternalMap.set(internalDesignRenderer, this)
    externalToInternalMap.set(this, internalDesignRenderer)
    this.#actionMap = new Map()
    this.#stateMap = new Map()
    this.#locale = 'zh'
  }
  watchData(listener: IDesignRendererDataChangeListener<Component>) {
    const internalDesignRenderer = getInternalDesignRenderer(this)
    internalDesignRenderer.designRendererDataListenerList.push(listener)
    const removeListener = () => {
      internalDesignRenderer.designRendererDataListenerList =
        internalDesignRenderer.designRendererDataListenerList.filter((e) => e !== listener)
    }
    return removeListener
  }
  getData() {
    return getInternalDesignRenderer(this).designRendererData
  }
  getDeps() {
    return getInternalDesignRenderer(this).deps
  }
  // 拆分？
  transferAttributeData(data: IAttributeSchemaData) {
    const transferMap: Record<IAttributeSchemaData['type'], (data: IAttributeSchemaData) => any> = {
      string: (data) => {
        if (data.type === 'string') {
          return String(data.value)
        }
      },
      number: (data) => {
        if (data.type === 'number') {
          return Number(data.value)
        }
      },
      boolean: (data) => {
        if (data.type === 'boolean') {
          return Boolean(data.value)
        }
      },
      object: (data) => {
        if (data.type === 'object') {
          let res: Record<string, any> = {}
          const { value = {} } = data
          try {
            Object.keys(value).map((key) => {
              const itemData = value[key]
              res[key] = transferMap[itemData.type](itemData)
            })
          } catch (error) {

          }

          return res
        }
      },
      action: (data) => {
        if (data.type === 'object') {
          let res: Record<string, any> = {}
          const { value = {} } = data
          Object.keys(value).map((key) => {
            const itemData = value[key]
            res[key] = transferMap[itemData.type](itemData)
          })
          return res
        }
      },
      state: (data) => {
        if (data.type === 'state') {
          return this.#stateMap.get(data.value)
        }
      },
      i18n: (data) => {
        if (data.type === 'i18n') {
          return data.value[this.#locale]
        }
      },
      json: (data) => {
        if (data.type === 'json') {
          return data.value
        }
      }
    }

    return transferMap[data.type]?.(data)
  }
  abstract mount(mountElementId: string): Promise<void> | void
  abstract getComponetnOverlayFromElement(element: Element): IDesignComponentOverlay | undefined
}

export interface IDesignRendererData<Component> {
  schemaData?: ISchemaData
  componentMap?: IComponentMap<Component>
  stateMap?: IStateSchemaMap
  mainComponentConfig?: IComponentConfigWithTemplatePid
}

export type IDesignRendererDataWatch<Component> = (
  listener: IDesignRendererDataChangeListener<Component>
) => void

export type IDesignRendererDataChangeListener<Component> = (
  data?: IDesignRendererData<Component>
) => void