import { getInnerContext } from '../context/contextManager'
import type { IContext } from '../context/createContext'
import type { IAction, IActionConfig } from './defineAction'

export const initAction = <T extends IAction>(
  configUid: string,
  contextId: string,
  isConsole: boolean = false // console 是不是太长了
  // 或者直接全部都输出？？？？
) => {
  //TODO: init action .....
  // TODO: init composition
  const innerContext = getInnerContext(context.uid)
  if (!innerContext) {
    return
  }
  const { name, init } = config
  if (!innerContext.hasAction(name)) {
    return
  }
  if (innerContext.isActionInited(name)) {
    return
  }
  const action = init(context)
  const actionMap = innerContext.getActionMap()
  actionMap.set(name, action)

  return action as T
}
