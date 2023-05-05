import { StateConfig } from '../schema/state/state'
import { deepFreeze } from '../utils/deepFreeze'
import { ResourceManager } from '../utils/resourceManager'
import { Context, internalContextManager } from './internalContext'

const exposeDefineHelperTag: unique symbol = Symbol('exposeDefineHelperTag')

export const internalDefineHelperManager =
  new ResourceManager<InternalDefineHelper>()

export class InternalDefineHelper {
  resourceName: string
  uid: string
  stateConfigManager = new ResourceManager<StateConfig>()
  constructor (name: string) {
    this.resourceName = name
    this.uid = internalDefineHelperManager.add(this)
  }
}

export type DefineHelper = ReturnType<typeof exposeDefineHelper>

export const exposeDefineHelper = (
  internalDefineHelper: InternalDefineHelper
) => {
  const { resourceName: name, stateConfigManager, uid } = internalDefineHelper
  const defineState = <T extends StateConfig>(config: T) => {
    const configUid = stateConfigManager.add(config)
    const useState = (context: Context) => {
      const { defineHelperUid } = context
      if (defineHelperUid !== uid) {
        return
      }
      const internalContext = internalContextManager.get(context.uid)
      if (!internalContext) {
        return
      }
      const { stateManager } = internalContext
      if (stateManager.has(configUid)) {
        return stateManager.get(configUid)
      } else {
        const { type } = config
        const state = createState()
      }
    }

    return useState
  }

  return deepFreeze({
    [exposeDefineHelperTag]: true,
    name
  })
}

export const createDefineHelper = (name: string) => {
  const internalDefineHelper = new InternalDefineHelper(name)
  const defineHelper = exposeDefineHelper(internalDefineHelper)
  return defineHelper
}
