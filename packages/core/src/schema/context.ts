import { ReactiveStore } from '@/utils/reactive'
import type { IStateSchema } from './state'

export interface IContextSchema {
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

export interface IContextStates {
  [stateName: string]: any
}

export interface IContextActions {
  [actionName: string]: Function
}

export type IContextOptions<
  S extends IContextStates = IContextStates,
  A extends IContextActions = IContextActions
> = {
  states: () => S
  actions: () => A
} & ThisType<{
  ctx: Context<S, A>
}>

export class Context<
  S extends IContextStates = IContextStates,
  A extends IContextActions = IContextActions
> {
  #states: ReactiveStore<S>
  #actions: ReactiveStore<A>
  constructor(options: IContextOptions<S, A>) {
    const states = options.states.apply(this)
    const actions = options.actions.apply(this)
    this.#states = new ReactiveStore<S>({ data: states })
    this.#actions = new ReactiveStore<A>({ data: actions })
  }
  get getAllStates() {
    return this.#states.getAll
  }
  get getState() {
    return this.#states.get
  }
  get setState() {
    return this.#states.set
  }
  get resetStates() {
    return this.#states.reset
  }
  get onStateChange() {
    return this.#states.on
  }
  get watchState() {
    return this.#states.watch
  }
  get getAllActions() {
    return this.#actions.getAll
  }
  get getAction() {
    return this.#actions.get
  }
  get setAction() {
    return this.#actions.set
  }
  get onActionChange() {
    return this.#actions.on
  }
  get watchAction() {
    return this.#actions.watch
  }
}

export type IContext = Context

export const defineContext = <
  S extends IContextStates = IContextStates,
  A extends IContextActions = IContextActions
>(
  options: IContextOptions<S, A>
) => options
