import { getCurrentInstance } from 'vue'
import { getInnerContext } from '../context/componentInstanceContextMap'
import type { IContext } from '../context/createContext'
import type { IState, IStateConfig, IStateType } from './defineState'

export const useState = <T, ST extends IStateType>(
  config: IStateConfig<T, ST>
) => {
  const currentInstance = getCurrentInstance()
  if (!currentInstance) {
    return
  }
  const { name } = config
  const innerContext = getInnerContext(currentInstance)
  if (!innerContext) {
    return
  }
  const { hasState } = innerContext
  if (!hasState(name)) {
    return
  }
  const state = innerContext.getState(name)
  return state as IState<T, ST>
}

export type IConfigToState<C extends IStateConfig> = C extends IStateConfig<
  infer T,
  infer ST
>
  ? IState<T, ST>
  : unknown

export type IConfigsToStates<CR extends Record<string, IStateConfig>> = {
  [key in keyof CR]: IConfigToState<CR[key]> | undefined
}

export const useStates = <CR extends Record<string, IStateConfig>>(
  configs: CR
): IConfigsToStates<CR> => {
  const states: Record<string, IState | undefined> = {}
  const currentInstance = getCurrentInstance()
  if (currentInstance) {
    const innerContext = getInnerContext(currentInstance)
    if (innerContext) {
      const keys = Object.keys(configs)
      keys.forEach(key => {
        states[key] = innerContext.getState(key)
      })
    }
  }

  return states as IConfigsToStates<CR>
}
