import { ReactiveStore } from '@/utils/reactive'
import type { IStateSchema } from './state'

export interface IModelSchema {
  imports?: IImportSchema[]
  states?: {
    name: string
    schema: IStateSchema
  }[]
  actions?: {
    name: string
    schema: string
  }[]
}

export interface IImportSchema {
  path: string
  aliasName?: string
  exportName?: string
  importAll?: boolean
  destructuring?: boolean
}

export interface IModelStore extends Record<string, any> {
  states: {
    [stateName: string]: any
  }
  actions: {
    [actionName: string]: Function
  }
}

export type IModelStoreMap<S extends IModelStore = IModelStore> = {
  [key in keyof S]: ReactiveStore<S[key]>
}

export class Model<S extends IModelStore> {
  #storeMap: IModelStoreMap<S>
  constructor(store: S) {
    const storeMap: {
      [key: string]: ReactiveStore
    } = {}
    Object.keys(store).map((key) => {
      storeMap[key] = new ReactiveStore({ data: store[key] })
    })
    this.#storeMap = storeMap as unknown as IModelStoreMap<S>
  }
  get getAllStates() {
    return this.#storeMap.states.getAll
  }
  get getState() {
    return this.#storeMap.states.get
  }
  get setState() {
    return this.#storeMap.states.set
  }
  get resetStates() {
    return this.#storeMap.states.reset
  }
  get onStateChange() {
    return this.#storeMap.states.on
  }
  get watchState() {
    return this.#storeMap.states.watch
  }
  get getAllActions() {
    return this.#storeMap.actions.getAll
  }
  get getAction() {
    return this.#storeMap.actions.get
  }
  get setAction() {
    return this.#storeMap.actions.set
  }
  get onActionChange() {
    return this.#storeMap.actions.on
  }
  get watchAction() {
    return this.#storeMap.actions.watch
  }
}

export type IModelStoreOptions<
  S extends IModelStore['states'],
  A extends IModelStore['actions'] = IActions
> = {
  // [key in keyof S]: S[key]
  states: S['states']
  actions: S['actions'] & ThisType<Model<S>>
}

export const defineModel = <S extends IModelStore>(store: IModelStoreOptions<S>) => {
  return () => {
    console.log(store)
    // const { setup } = options
    // const ctx = new ViewContext({ states: {}, actions: {} }) as unknown as ViewContext<S, A>
    // const { states, actions } = setup.apply(ctx)
    // ctx.states.reset(states)
    // ctx.actions.reset(actions)
    // return ctx
  }
}

const v = new Model({
  states: {
    s: 1,
    sddd: 'ss'
  },
  actions: {
    sss() {
      const s = this.getState('s')
    }
  }
})

v.getState('s')

defineModel({
  states: {
    s: 1,
    sddd: 'ss'
  },
  actions: {
    sss() {
      const s = this.getState('s')
    }
  }
})
