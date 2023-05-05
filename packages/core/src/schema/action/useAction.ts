import { getInternalContext } from '../context/contextManager'
import type { Context } from '../context/createContext'
import type { Action, ActionConfig } from './defineAction'

export const useAction = <T extends Action>(
  context: Context,
  config: ActionConfig<T>
) => {
  const { name } = config
  const internalContext = getInternalContext(context.uid)
  if (!internalContext) {
    return
  }
  const { hasAction } = internalContext
  if (!hasAction(name)) {
    return
  }
  const action = internalContext.getAction(name)
  return action as T
}

export type ConfigToAction<C extends ActionConfig> = C extends ActionConfig<
  infer T
>
  ? T
  : unknown

export type ConfigsToActions<CR extends Record<string, ActionConfig>> = {
  [key in keyof CR]: ConfigToAction<CR[key]> | undefined
}

export const useActions = <CR extends Record<string, ActionConfig>>(
  context: Context,
  configs: CR
): ConfigsToActions<CR> => {
  const actions: Record<string, Action | undefined> = {}
  const internalContext = getInternalContext(context.uid)
  if (internalContext) {
    const keys = Object.keys(configs)
    keys.forEach(key => {
      actions[key] = internalContext.getAction(key)
    })
  }
  return actions as ConfigsToActions<CR>
}
