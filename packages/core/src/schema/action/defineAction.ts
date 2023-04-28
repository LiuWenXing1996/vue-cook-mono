import { deepFreeze } from '../../utils/deepFreeze'
import type { IContext } from '../context/createContext'
import { IBaseDefineConfig } from '../context/defineHelperManager'

export type IAction = Function

export interface IActionConfig<T extends IAction = IAction>
  extends IBaseDefineConfig {
  name: string
  init: (context: IContext) => T
  expose?: boolean
}

export interface IActionConfigId<T extends IAction = IAction> {
  id: string
  __onlyForActionType__: T
}

export type IActionMap = Map<string, IAction | undefined>

export const defineAction = <T extends IAction>(config: IActionConfig<T>) =>
  deepFreeze(config)

export type IDefineAction = typeof defineAction
