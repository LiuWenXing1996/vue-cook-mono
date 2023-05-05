import { Context, internalContextManager } from '../context/contextManager'
import { InternalDefineHelper } from '../context/defineHelperManager'
import { StateConfig, StateType } from './base'

export const internalDefineState = <T, ST extends StateType>(
  config: StateConfig<T, ST>,
  internalDefineHelper: InternalDefineHelper
) => {
  const { stateConfigManager } = internalDefineHelper
  const configUid = stateConfigManager.makeUid(config.resourceName)
  stateConfigManager.set(configUid, {
    ...config,
    uid: configUid
  })

  const useState = (context: Context) => {
    const internalContext = internalContextManager.get(context.uid)
    if (!internalContext) {
      return
    }
    return internalContext.stateManager.get(configUid)
  }
}
