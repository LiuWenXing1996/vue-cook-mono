import {
  type IComponentConfigWithTemplatePid,
  type IComponentMap,
  type IStateMap
} from '@/schema/component'
import { type IDeps } from '@/utils/fetchDeps'
import type { IDesignComponentOverlay, ISchemaData } from './renderer-context'

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
  constructor() {
    const internalDesignRenderer = new InternalDesignRenderer()
    internalToExternalMap.set(internalDesignRenderer, this)
    externalToInternalMap.set(this, internalDesignRenderer)
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
  abstract mount(mountElementId: string): Promise<void> | void
  abstract getComponetnOverlayFromElement(element: Element): IDesignComponentOverlay | undefined
}

export interface IDesignRendererData<Component> {
  schemaData?: ISchemaData
  componentMap?: IComponentMap<Component>
  stateMap?: IStateMap
  mainComponentConfig?: IComponentConfigWithTemplatePid
}

export type IDesignRendererDataWatch<Component> = (
  listener: IDesignRendererDataChangeListener<Component>
) => void

export type IDesignRendererDataChangeListener<Component> = (
  data?: IDesignRendererData<Component>
) => void
