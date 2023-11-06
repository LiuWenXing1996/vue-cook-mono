import {
  type IComponentConfigWithTemplatePid,
  type IComponentMap,
  type IStateMap
} from '@/schema/component'
import { type IDeps } from '@/utils/fetchDeps'
import type { ISchemaData } from './editor-renderer-context'

const internalToExternalMap = new WeakMap<InternalEditorRenderer, AbstractEditorRenderer>()
const externalToInternalMap = new WeakMap<AbstractEditorRenderer, InternalEditorRenderer>()

export const getInternalEditorRenderer = <Component>(
  renderer: AbstractEditorRenderer<Component>
) => {
  return externalToInternalMap.get(renderer) as InternalEditorRenderer<Component>
}

export const getEditorRenderer = <Component>(renderer: InternalEditorRenderer<Component>) => {
  return internalToExternalMap.get(renderer) as AbstractEditorRenderer<Component>
}

class InternalEditorRenderer<Component = any> {
  editorRendererData?: IEditorRendererData<Component>
  deps?: IDeps
  editorRendererDataListenerList: IEditorRendererDataChangeListener<Component>[]
  constructor() {
    this.editorRendererDataListenerList = []
  }
}

export abstract class AbstractEditorRenderer<Component = any> {
  constructor() {
    const internalEditorRenderer = new InternalEditorRenderer()
    internalToExternalMap.set(internalEditorRenderer, this)
    externalToInternalMap.set(this, internalEditorRenderer)
  }
  watchData(listener: IEditorRendererDataChangeListener<Component>) {
    const internalEditorRenderer = getInternalEditorRenderer(this)
    internalEditorRenderer.editorRendererDataListenerList.push(listener)
    const removeListener = () => {
      internalEditorRenderer.editorRendererDataListenerList =
        internalEditorRenderer.editorRendererDataListenerList.filter((e) => e !== listener)
    }
    return removeListener
  }
  getData() {
    return getInternalEditorRenderer(this).editorRendererData
  }
  getDeps() {
    return getInternalEditorRenderer(this).deps
  }
  abstract mount(mountElementId: string): Promise<void> | void
}

export interface IEditorRendererData<Component> {
  attributes: Map<string, Component>
  events: Map<string, Component>
  slots: Map<string, Component>
  mainComponentConfig?: IComponentConfigWithTemplatePid
}

export type IEditorRendererDataWatch<Component> = (
  listener: IEditorRendererDataChangeListener<Component>
) => void

export type IEditorRendererDataChangeListener<Component> = (
  data?: IEditorRendererData<Component>
) => void
