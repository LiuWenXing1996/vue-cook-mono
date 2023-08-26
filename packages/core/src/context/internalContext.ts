import { Action } from '../schema/action/action'
import { State, StateType } from '../schema/state/state'
import { deepFreeze } from '../utils/deepFreeze'
import { ResourceManager } from '../utils/resourceManager'

const exposeContextTag: unique symbol = Symbol('exposeContextTag')

export const internalContextManager = new ResourceManager<InternalContext>()

export class InternalContext {
  name: string
  uid: string
  defineHelperUid: string
  stateManager = new ResourceManager<State<any, StateType> | undefined>()
  actionManager = new ResourceManager<Action<any> | undefined>()
  constructor (name: string, defineHelperUid: string) {
    this.name = name
    this.defineHelperUid = defineHelperUid
    this.uid = internalContextManager.add(name, this)
  }
}

export type Context = ReturnType<typeof exposeContext>

export const exposeContext = (internalContext: InternalContext) => {
  const { name: name, uid, defineHelperUid } = internalContext

  return deepFreeze({
    [exposeContextTag]: true,
    name,
    uid,
    defineHelperUid
  }) as any
}

export const createContext = (name: string, defineHelperUid: string) => {
  const internalContext = new InternalContext(name, defineHelperUid)
  const context = exposeContext(internalContext)
  return context
}
