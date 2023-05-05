import { getInternalContext } from '../context/contextManager'
import type { Context } from '../context/createContext'
import type { Action, ActionConfig } from './defineAction'

export const initAction = <T extends Action>(
  configUid: string,
  contextId: string,
  isConsole: boolean = false // console 是不是太长了
  // 或者直接全部都输出？？？？
) => {
  //TODO: init action .....
  // TODO: init composition
  const internalContext = getInternalContext(context.uid)
  if (!internalContext) {
    return
  }
  const { name, init } = config
  if (!internalContext.hasAction(name)) {
    return
  }
  if (internalContext.isActionInited(name)) {
    return
  }
  const action = init(context)
  const actionMap = internalContext.getActionMap()
  actionMap.set(name, action)

  return action as T
}
