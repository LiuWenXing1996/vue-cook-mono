import { Context, internalContextManager } from '../../context/internalContext'
import { InternalDefineHelper } from '../../context/internalHelper'
import { createResourceUid } from '../../utils/resourceManager'
import { State, StateConfig, StateType, createState } from './state'

export type GetConfigType<C extends StateConfig<any, StateType>> =
  C extends StateConfig<infer T, StateType> ? T : unknown

export const createDefineState = (defineHelper: InternalDefineHelper) => {
  const { stateConfigManager } = defineHelper
  const defineState = <C extends StateConfig<any, StateType>>(config: C) => {
    const stateUid = createResourceUid(config.logName)
    stateConfigManager.addByUid(stateUid, config.logName, config)
    const useState = (context: Context) => {
      const { defineHelperUid } = context
      if (defineHelperUid !== defineHelper.uid) {
        return
      }
      const internalContext = internalContextManager.get(context.uid)
      if (!internalContext) {
        return
      }
      const { stateManager } = internalContext
      let state: State<any, StateType> | undefined = undefined
      if (stateManager.has(stateUid)) {
        state = stateManager.get(stateUid)
      } else {
        state = createState(config, internalContext)
        stateManager.addByUid(stateUid, config.logName, state)
      }
      return state as State<GetConfigType<C>, C['type']>
    }

    return useState
  }

  return defineState
}
