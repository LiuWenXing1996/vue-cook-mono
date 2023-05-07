import { computed, WritableComputedRef } from 'vue'
import {
  BaseStateConfigWithWatcher,
  BaseStateWithWatcher,
  StateWithWatcherTypeRequireDeclare
} from './baseStateWithWatcher'
import { exposeContext } from '../../context/internalContext'

export type WritableComputedStateDeclare<T> =
  StateWithWatcherTypeRequireDeclare<
    T,
    WritableComputedRef<T>,
    'WritableComputed',
    {
      get: () => T
      set: (value: T) => void
    },
    T,
    BaseStateConfigWithWatcher<
      'WritableComputed',
      {
        get: () => T
        set: (value: T) => void
      },
      T
    >
  >

export class WritableComputedState<T> extends BaseStateWithWatcher<
  WritableComputedStateDeclare<T>['ValueType'],
  WritableComputedStateDeclare<T>['TheStateType'],
  WritableComputedStateDeclare<T>['InitReturnType'],
  WritableComputedStateDeclare<T>['WatchCallbackValueType'],
  WritableComputedStateDeclare<T>['Config']
> {
  getType (): 'WritableComputed' {
    return 'WritableComputed'
  }
  initState () {
    const { config, context } = this
    const { init } = config
    const { get, set } = init(exposeContext(context))
    const state = computed({ get, set })
    return state
  }
}
