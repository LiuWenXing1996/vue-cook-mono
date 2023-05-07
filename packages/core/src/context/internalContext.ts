import { State, StateType } from '../schema/state/state'
import { deepFreeze } from '../utils/deepFreeze'
import { ResourceManager } from '../utils/resourceManager'

const exposeContextTag: unique symbol = Symbol('exposeContextTag')

export const internalContextManager = new ResourceManager<InternalContext>()

export class InternalContext {
  name: string
  uid: string
  defineHelperUid: string
  //TODO:实现Action
  stateManager = new ResourceManager<State<any, StateType> | undefined>()
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
  })
}

export const createContext = (name: string, defineHelperUid: string) => {
  const internalContext = new InternalContext(name, defineHelperUid)
  const defineHelper = exposeContext(internalContext)
  return defineHelper
}
