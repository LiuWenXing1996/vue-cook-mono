import { Ref, UnwrapRef, ref } from 'vue'
import {
  BaseStateConfigWithWatcher,
  BaseStateWithWatcher,
  StateWithWatcherTypeRequireDeclare
} from './baseStateWithWatcher'
import { exposeContext } from '../../context/internalContext'

export type RefStateDeclare<T> = StateWithWatcherTypeRequireDeclare<
  T,
  Ref<UnwrapRef<T>>,
  'Ref',
  T,
  UnwrapRef<T> | T,
  BaseStateConfigWithWatcher<'Ref', T, UnwrapRef<T> | T>
>

export class RefState<T> extends BaseStateWithWatcher<
  RefStateDeclare<T>['ValueType'],
  RefStateDeclare<T>['TheStateType'],
  RefStateDeclare<T>['InitReturnType'],
  RefStateDeclare<T>['WatchCallbackValueType'],
  RefStateDeclare<T>['Config']
> {
  getType (): 'Ref' {
    return 'Ref'
  }
  initState () {
    const { config, context } = this
    const { init } = config
    const initFuncRes = init(exposeContext(context))
    const state = ref(initFuncRes)
    return state
  }
}
