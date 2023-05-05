import { ShallowRef, UnwrapRef, ref, shallowRef } from 'vue'
import {
  BaseStateConfigWithWatcher,
  BaseStateWithWatcher,
  StateWithWatcherTypeRequireDeclare
} from './baseStateWithWatcher'
import { exposeContext } from '../../context/internalContext'

export type ShallowRefStateDeclare<T> = StateWithWatcherTypeRequireDeclare<
  T,
  ShallowRef<T>,
  'ShallowRef',
  T,
  UnwrapRef<T> | T,
  BaseStateConfigWithWatcher<'ShallowRef', T, UnwrapRef<T> | T>
>

export class ShallowRefState<T> extends BaseStateWithWatcher<
  ShallowRefStateDeclare<T>['ValueType'],
  ShallowRefStateDeclare<T>['TheStateType'],
  ShallowRefStateDeclare<T>['InitReturnType'],
  ShallowRefStateDeclare<T>['WatchCallbackValueType'],
  ShallowRefStateDeclare<T>['Config']
> {
  getType (): 'ShallowRef' {
    return 'ShallowRef'
  }
  initState () {
    const { config, context } = this
    const { init } = config
    const stateInitFuncRes = init(exposeContext(context))
    const state = shallowRef(stateInitFuncRes)
    return state
  }
}
