import { createDefineState } from '../schema/state/createDefineState'
import { StateType } from '../schema/state/state'
import { StateConfig } from '../schema/state/state'
import { deepFreeze } from '../utils/deepFreeze'
import { ResourceManager } from '../utils/resourceManager'

const exposeDefineHelperTag: unique symbol = Symbol('exposeDefineHelperTag')

export const internalDefineHelperManager =
  new ResourceManager<InternalDefineHelper>()

export class InternalDefineHelper {
  #uid: string
  #name: string
  stateConfigManager = new ResourceManager<StateConfig<any, StateType>>()
  constructor (name: string) {
    this.#name = name
    this.#uid = internalDefineHelperManager.add(name, this)
  }
  get uid () {
    return this.#uid
  }
  get name () {
    return this.#name
  }
}

export type DefineHelper = ReturnType<typeof exposeDefineHelper>

export type GetConfigType<C extends StateConfig<any, StateType>> =
  C extends StateConfig<infer T, StateType> ? T : unknown

export const exposeDefineHelper = (
  internalDefineHelper: InternalDefineHelper
) => {
  const { name } = internalDefineHelper

  return deepFreeze({
    [exposeDefineHelperTag]: true,
    name,
    defineState: createDefineState(internalDefineHelper)
  })
}

export const createDefineHelper = (name: string) => {
  const internalDefineHelper = new InternalDefineHelper(name)
  const defineHelper = exposeDefineHelper(internalDefineHelper)
  return defineHelper
}

const defineHelper = createDefineHelper('d')

const useStateA = defineHelper.defineState({
  type: 'Ref',
  logName: 'ss',
  init: () => {
    return 'undefined'
  }
})
