import { ComponentInternalInstance } from 'vue'
import type { IInnerContext } from './createContext'

const componentInstanceContextMap: Map<
  ComponentInternalInstance,
  IInnerContext
> = new Map()
const contextComponentInstanceMap: Map<
  IInnerContext,
  ComponentInternalInstance
> = new Map()

export const getInnerContext = (
  componentInstance: ComponentInternalInstance
) => {
  return componentInstanceContextMap.get(componentInstance)
}

export const link = (
  componentInstance: ComponentInternalInstance,
  innerContext: IInnerContext
) => {
  componentInstanceContextMap.set(componentInstance, innerContext)
  contextComponentInstanceMap.set(innerContext, componentInstance)
}

export const getComponentInstance = (innerContext: IInnerContext) => {
  return contextComponentInstanceMap.get(innerContext)
}
