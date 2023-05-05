import { State } from '../schema/state/state'
import { deepFreeze } from '../utils/deepFreeze'
import { ResourceManager } from '../utils/resourceManager'

const exposeContextTag: unique symbol = Symbol('exposeContextTag')

export const internalContextManager = new ResourceManager<InternalContext>()

export class InternalContext {
  resourceName: string
  uid: string
  defineHelperUid: string
  stateManager = new ResourceManager<State>()
  constructor (name: string, defineHelperUid: string) {
    this.resourceName = name
    this.defineHelperUid = defineHelperUid
    this.uid = internalContextManager.add(this)
  }
}

export type Context = ReturnType<typeof exposeContext>

export const exposeContext = (internalContext: InternalContext) => {
  const { resourceName: name, uid, defineHelperUid } = internalContext

  return deepFreeze({
    [exposeContextTag]: true,
    name,
    uid,
    defineHelperUid
  })
}

export const createContext = (name: string, defineHelperUid: string) => {
  const internalContext = new InternalContext(name, defineHelperUid)
  const defineHelper = exposeContext(internalContext)
  return defineHelper
}
