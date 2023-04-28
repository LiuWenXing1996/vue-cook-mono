import { getInnerContext } from '../context/contextManager'
import type { IContext } from '../context/createContext'
import type { IAction, IActionConfig } from './defineAction'

export const useAction = <T extends IAction>(
  context: IContext,
  config: IActionConfig<T>
) => {
  const { name } = config
  const innerContext = getInnerContext(context.uid)
  if (!innerContext) {
    return
  }
  const { hasAction } = innerContext
  if (!hasAction(name)) {
    return
  }
  const action = innerContext.getAction(name)
  return action as T
}

export type IConfigToAction<C extends IActionConfig> = C extends IActionConfig<
  infer T
>
  ? T
  : unknown

export type IConfigsToActions<CR extends Record<string, IActionConfig>> = {
  [key in keyof CR]: IConfigToAction<CR[key]> | undefined
}

export const useActions = <CR extends Record<string, IActionConfig>>(
  context: IContext,
  configs: CR
): IConfigsToActions<CR> => {
  const actions: Record<string, IAction | undefined> = {}
  const innerContext = getInnerContext(context.uid)
  if (innerContext) {
    const keys = Object.keys(configs)
    keys.forEach(key => {
      actions[key] = innerContext.getAction(key)
    })
  }
  return actions as IConfigsToActions<CR>
}
