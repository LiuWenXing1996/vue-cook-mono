import { ReactiveStore } from '@/utils/reactive'
import type { ILowcodeContext } from './lowcode-context'

export class ViewContext<View> {
  #lowcodeContext: ILowcodeContext
  constructor(params: { lowcodeContext: ILowcodeContext }) {
    const { lowcodeContext } = params
    this.#lowcodeContext = lowcodeContext
  }
  get getDeps() {
    return () => {
      return this.#lowcodeContext.getDeps
    }
  }
  #components = new ReactiveStore<{
    [cmptName: string]: View | undefined
  }>({ data: {} })
  get components() {
    return this.#components
  }
  #states = new ReactiveStore<{
    [stateName: string]: any
  }>({ data: {} })
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
  #actions = new ReactiveStore<{
    [actionName: string]: any
  }>({ data: {} })
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

export type IViewContext<View = any> = ViewContext<View>
