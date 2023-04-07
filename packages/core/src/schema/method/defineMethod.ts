import { deepFreeze } from '../../utils/deepFreeze'
import { getInnerContext } from '../context/contextMap'
import type { IContext } from '../context/createContext'

export type IMethod = Function

export interface IMethodConfig<T extends IMethod = IMethod> {
  name: string
  init: (context: IContext) => T
  expose?: boolean
}

export interface IMethodConfigId<T extends IMethod = IMethod> {
  id: string
  __onlyForMethodType__: T
}

export type IMethodMap = Map<string, IMethod | undefined>

export const defineMethod = <T extends IMethod>(config: IMethodConfig<T>) =>
  deepFreeze(config)

export type IDefineMethod = typeof defineMethod
