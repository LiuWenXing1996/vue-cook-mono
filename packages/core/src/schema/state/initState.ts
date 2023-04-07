import {
  ComponentInternalInstance,
  UnwrapRef,
  WatchStopHandle,
  getCurrentInstance,
  onMounted
} from 'vue'
import { computed, ref, watch } from 'vue'
import { getInnerContext } from '../context/componentInstanceContextMap'
import type { IState, IStateConfig, IStateType } from './defineState'

export type IStateInitFunction<T, ST extends IStateType> = () => IStateInitRes<
  T,
  ST
>

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
  config: IStateConfig<T, ST>,
  componentInstance: ComponentInternalInstance
) => {
  const innerContext = getInnerContext(componentInstance)
  if (!innerContext) {
    return
  }
  const { name, init, watchers = [], type } = config
  if (!innerContext.hasState(name)) {
    return
  }
  if (innerContext.isStateInited(name)) {
    return
  }
  const stateInit = init()
  let state: IState<T, IStateType> | undefined = undefined
  if (type === 'Ref') {
    state = ref(stateInit as IStateInitRes<T, 'Ref'>)
  }
  if (type === 'Computed') {
    const { getter } = stateInit as IStateInitRes<T, 'Computed'>
    state = computed(getter)
  }
  if (type === 'ComputedWritable') {
    const { getter, setter } = stateInit as IStateInitRes<T, 'ComputedWritable'>
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
          return watcher.callback(...rest, stopHandler)
        },
        {
          deep,
          immediate,
          flush
        }
      )
    })
  }
  const stateMap = innerContext.getStateMap()
  stateMap.set(name, state) // 即使state最后的结果是undefined，也算state初始化成功
  return state as IState<T, ST>
}

export const initStates = (configs: Record<string, IStateConfig>) => {
  onMounted(() => {
    const componentInstance = getCurrentInstance()
  })
}
