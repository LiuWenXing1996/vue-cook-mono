import { ReactiveStore, type IReactiveStoreData } from '@/utils/reactive'
import type { ILowcodeContext } from './lowcode-context'
import type { IAction, IAsyncAction } from '@/schema/action'

export interface IStates {
  [stateName: string]: any
}

export interface IActions {
  [actionName: string]: IAction | IAsyncAction
}

export class ViewContext<S extends IStates = IStates, A extends IActions = IActions> {
  #states: ReactiveStore<S>
  #actions: ReactiveStore<A>
  constructor(params: { states: S; actions: A }) {
    const { states, actions } = params
    this.#states = new ReactiveStore<S>({ data: states })
    this.#actions = new ReactiveStore<A>({ data: actions })
  }
  get states() {
    return this.#states
  }
  get getState() {
    return this.#states.get
  }
  get setState() {
    return this.#states.set
  }
  get resetState() {
    return this.#states.reset
  }
  get onStateChange() {
    return this.#states.on
  }
  get watchState() {
    return this.#states.watch
  }
  get actions() {
    return this.#actions
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

export type IViewContext = ViewContext

export type IDefineViewContextOptions<
  S extends IStates = IStates,
  A extends IActions = IActions
> = {
  setup: () => {
    states: S
    actions: A
  }
} & ThisType<{
  ctx: ViewContext<S, A>
}>

export const defineViewContext = <S extends IStates = IStates, A extends IActions = IActions>(
  options: IDefineViewContextOptions<S, A>
) => {
  return () => {
    const { setup } = options
    const ctx = new ViewContext({ states: {}, actions: {} }) as unknown as ViewContext<S, A>
    const { states, actions } = setup.apply(ctx)
    ctx.states.reset(states)
    ctx.actions.reset(actions)
    return ctx
  }
}
