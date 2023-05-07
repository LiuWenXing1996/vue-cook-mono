import {
  Context,
  InternalContext,
  exposeContext
} from '../../context/internalContext'
import { BaseDefineConfig } from '../../context/internalHelper'

export type ActionValue = Function

export interface ActionConfig<T extends ActionValue> extends BaseDefineConfig {
  init: (context: Context) => T
}

export class Action<T extends ActionValue> {
  logName: string
  value: T | undefined
  config: ActionConfig<T>
  context: InternalContext
  constructor (config: ActionConfig<T>, context: InternalContext) {
    const { logName } = config
    this.logName = logName
    this.config = config
    this.context = context
    this.value = this.initAction()
  }
  initAction () {
    const { config, context } = this
    const { init } = config
    const initFuncRes = init(exposeContext(context))
    return initFuncRes
  }
}
