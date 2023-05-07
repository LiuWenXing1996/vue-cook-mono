import { exposeContext } from '../../context/internalContext'
import {
  BaseState,
  BaseStateConfig,
  StateTypeRequireDeclare
} from './baseState'

export type RawStateDeclare<T> = StateTypeRequireDeclare<
  T,
  T,
  'Raw',
  T,
  BaseStateConfig<'Raw', T>
>

export class RawState<T> extends BaseState<
  RawStateDeclare<T>['ValueType'],
  RawStateDeclare<T>['TheStateType'],
  RawStateDeclare<T>['InitReturnType'],
  RawStateDeclare<T>['Config']
> {
  getType (): 'Raw' {
    return 'Raw'
  }
  initState () {
    const { config, context } = this
    const { init } = config
    const stateInitFuncRes = init(exposeContext(context))
    const state = stateInitFuncRes
    return state
  }
}
