import { computed, ComputedRef } from 'vue'
import {
  BaseStateConfigWithWatcher,
  BaseStateWithWatcher,
  StateWithWatcherTypeRequireDeclare
} from './baseStateWithWatcher'
import { exposeContext } from '../../context/internalContext'

export type ComputedStateDeclare<T> = StateWithWatcherTypeRequireDeclare<
  T,
  ComputedRef<T>,
  'Computed',
  {
    get: () => T
  },
  T,
  BaseStateConfigWithWatcher<
    'Computed',
    {
      get: () => T
    },
    T
  >
>

export class ComputedState<T> extends BaseStateWithWatcher<
  ComputedStateDeclare<T>['ValueType'],
  ComputedStateDeclare<T>['TheStateType'],
  ComputedStateDeclare<T>['InitReturnType'],
  ComputedStateDeclare<T>['WatchCallbackValueType'],
  ComputedStateDeclare<T>['Config']
> {
  getType (): 'Computed' {
    return 'Computed'
  }
  initState () {
    const { config, context } = this
    const { init } = config
    const { get } = init(exposeContext(context))
    const state = computed(get)
    return state
  }
}
