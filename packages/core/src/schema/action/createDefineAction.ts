import { Context, internalContextManager } from '../../context/internalContext'
import { InternalDefineHelper } from '../../context/internalHelper'
import { createResourceUid } from '../../utils/resourceManager'
import { Action, ActionConfig, ActionValue } from './action'

export type GetConfigType<C extends ActionConfig<ActionValue>> =
  C extends ActionConfig<infer T> ? T : unknown

export const createDefineAction = (defineHelper: InternalDefineHelper) => {
  const { actionConfigManager } = defineHelper
  const defineAction = <C extends ActionConfig<ActionValue>>(config: C) => {
    const actionUid = createResourceUid(config.logName)
    actionConfigManager.addByUid(actionUid, config.logName, config)
    const useAction = (context: Context) => {
      const { defineHelperUid } = context
      if (defineHelperUid !== defineHelper.uid) {
        return
      }
      const internalContext = internalContextManager.get(context.uid)
      if (!internalContext) {
        return
      }
      const { actionManager } = internalContext
      let action: Action<any> | undefined = undefined
      if (actionManager.has(actionUid)) {
        action = actionManager.get(actionUid)
      } else {
        action = new Action(config, internalContext)
        actionManager.addByUid(actionUid, config.logName, action)
      }
      return action as Action<GetConfigType<C>>
    }

    return useAction
  }

  return defineAction
}
