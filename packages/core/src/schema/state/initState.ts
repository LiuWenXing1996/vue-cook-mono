import type { UnwrapRef, WatchStopHandle } from 'vue'
import { computed, ref, watch } from 'vue'
import {
  IContext,
  exposeContext,
  innerContextManager
} from '../context/contextManager'
import type { IState, IStateConfig, IStateType } from './defineState'
import { getInnerDefineHelperByContextUid } from '../context/defineHelperManager'
import { IDeepReadonlyWithUid } from '../../utils/deepFreeze'

export type IStateInitFunction<T, ST extends IStateType> = (
  context: IContext
) => IStateInitRes<T, ST>

export type IStateInitRes<T, ST extends IStateType> = ST extends 'Ref'
  ? IRefStateInitReturn<T>
  : ST extends 'Computed'
  ? IComputedReadOnlyStateInitReturn<T>
  : ST extends 'ComputedWritable'
  ? IComputedStateInitReturn<T>
  : never

export type IRefStateInitReturn<T> = T

export interface IComputedStateInitReturn<T> {
  getter: () => T
  setter: (value: T) => void
}

export type IComputedReadOnlyStateInitReturn<T> = {
  getter: () => T
}

export const initState = <T, ST extends IStateType>(
  configUid: string,
  contextId: string,
  isConsole: boolean = false
) => {
  const innerContext = innerContextManager.get(contextId, isConsole)
  if (!innerContext) {
    return
  }
  const { stateManager } = innerContext
  const { isNeedInit } = stateManager
  if (!isNeedInit(configUid, isConsole)) {
    return
  }
  const innerDefineHelper = getInnerDefineHelperByContextUid(contextId)
  if (!innerDefineHelper) {
    return
  }
  const { stateConfigManager } = innerDefineHelper
  const config = stateConfigManager.get(configUid, isConsole)
  if (!config) {
    return
  }
  const {
    init,
    watchers = [],
    type
  } = config as IDeepReadonlyWithUid<IStateConfig<T, ST>>
  const context = exposeContext(innerContext)
  const stateInitFuncRes = init(context)
  let state: IState<T, IStateType> | undefined = undefined
  if (type === 'Ref') {
    state = ref(stateInitFuncRes as IStateInitRes<T, 'Ref'>)
  }
  if (type === 'Computed') {
    const { getter } = stateInitFuncRes as IStateInitRes<T, 'Computed'>
    state = computed(getter)
  }
  if (type === 'ComputedWritable') {
    const { getter, setter } = stateInitFuncRes as IStateInitRes<
      T,
      'ComputedWritable'
    >
    state = computed({
      get: getter,
      set: setter
    })
  }
  if (state) {
    const watchState = state
    watchers.forEach(watcher => {
      const { deep, immediate, flush } = watcher
      const stopHandler: WatchStopHandle = watch<
        UnwrapRef<typeof watchState>,
        boolean
      >(
        watchState,
        (...rest) => {
          return watcher.callback(context, ...rest, stopHandler)
        },
        {
          deep,
          immediate,
          flush
        }
      )
    })
  }
  if (!stateManager.isInited(configUid)) {
    stateManager.set(configUid, state)
  }
  return state as IState<T, ST>
}
