import { deepFreeze } from '../../utils/deepFreeze'
import type { Context } from '../context/createContext'
import { DefineConfigBase } from '../context/defineHelperManager'

export type Action = Function

export interface ActionConfig<T extends Action = Action>
  extends DefineConfigBase {
  name: string
  init: (context: Context) => T
  expose?: boolean
}

export interface ActionConfigId<T extends Action = Action> {
  id: string
  __onlyForActionType__: T
}

export type ActionMap = Map<string, Action | undefined>

export const defineAction = <T extends Action>(config: ActionConfig<T>) =>
  deepFreeze(config)

export type DefineAction = typeof defineAction
