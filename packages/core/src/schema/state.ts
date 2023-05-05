import {
  ComputedRef,
  Ref,
  UnwrapRef,
  WatchStopHandle,
  WritableComputedRef,
  computed,
  ref,
  watch
} from 'vue'
import { DeepReadonlyWithUid, deepFreeze } from '../utils/deepFreeze'
import { Type } from '../utils/types/type'
import {
  DefineConfigBase,
  getInternalDefineHelperByContextUid
} from './context/defineHelperManager'
import {
  Context,
  exposeContext,
  internalContextManager
} from './context/contextManager'
import { createResourceManager } from '../utils/resourceManager'
import { TypeUid, createTypeUid } from '../utils/typeUid'

export type StateType = 'Ref' | 'Computed' | 'ComputedWritable'

export interface StateConfig<T = any, ST extends StateType = StateType>
  extends DefineConfigBase {
  type: ST
  consoleName?: string
  typeDefine?: Type<T>
  expose?: boolean
  init: StateInitFunction<T, ST>
  watchers?: WatchConfig<T>[]
}

export type WatchCallback<T> = (
  context: Context,
  value: UnwrapRef<T> | T,
  oldValue: UnwrapRef<T> | T | undefined,
  onCleanup: (cleanupFn: () => void) => void,
  stopHandler: () => void
) => void

export interface WatchConfig<T> {
  callback: WatchCallback<T>
  immediate?: boolean // 默认：false
  deep?: boolean // 默认：false
  flush?: 'pre' | 'post' | 'sync' // 默认：'pre'
}

export type State<T = any, ST extends StateType = StateType> = ST extends 'Ref'
  ? Ref<UnwrapRef<T>>
  : ST extends 'Computed'
  ? ComputedRef<T>
  : ST extends 'ComputedWritable'
  ? WritableComputedRef<T>
  : never
export type StateMap = Map<string, State | undefined>

export const createStateConfigManager = (defineHelperUid: string) => {
  const manager = createResourceManager<DeepReadonlyWithUid<StateConfig>>(
    'stateConfig',
    {
      uid: defineHelperUid,
      type: 'defineHelper'
    }
  )

  const define = <T, ST extends StateType = StateType>(
    config: StateConfig<T, ST>
  ) => {
    const uid = manager.makeUid(config.resourceName)
    const configWithUid = deepFreeze({
      ...config,
      uid
    })
    manager.set(uid, configWithUid)
    const tuid = createTypeUid<DeepReadonlyWithUid<StateConfig<T, ST>>>(uid)
    return tuid
  }

  return {
    ...manager,
    define
  }
}

export type GetInit<T extends StateConfig<any, any>> = ReturnType<T['init']>

export type ConfigTuidsToStates<
  CR extends Record<string, TypeUid<StateConfig>>
> = {
  [key in keyof CR]: ConfigTuidToState<CR[key]> | undefined
}

export type ConfigTuidToState<C extends TypeUid<StateConfig>> =
  C extends TypeUid<StateConfig<infer T, infer ST>> ? State<T, ST> : unknown

export type ConfigToState<C extends StateConfig> = C extends StateConfig<
  infer T,
  infer ST
>
  ? State<T, ST>
  : unknown

export type ConfigsToStates<CR extends Record<string, StateConfig>> = {
  [key in keyof CR]: ConfigToState<CR[key]> | undefined
}

export const createStateManager = (conetxtUid: string) => {
  const manager = createResourceManager<State>('state', {
    uid: conetxtUid,
    type: 'context'
  })

  const useState = <T extends StateConfig>(tuid: TypeUid<T>) => {
    const uid = tuid.value
    const state = manager.get(uid)
    if (state) {
      return state as ConfigToState<T>
    }
    return undefined
  }

  const useStates = <TS extends Record<string, TypeUid<StateConfig>>>(
    tuids: TS
  ): ConfigTuidsToStates<TS> => {
    const states: Record<string, State | undefined> = {}
    const keys = Object.keys(tuids)
    keys.forEach(key => {
      states[key] = manager.get(tuids[key].value)
    })
    return states as ConfigTuidsToStates<TS>
  }

  return {
    ...manager,
    useState,
    useStates
  }
}

export type StateInitFunction<T, ST extends StateType> = (
  context: Context
) => StateInitRes<T, ST>

export type StateInitRes<T, ST extends StateType> = ST extends 'Ref'
  ? RefStateInitReturn<T>
  : ST extends 'Computed'
  ? ComputedReadOnlyStateInitReturn<T>
  : ST extends 'ComputedWritable'
  ? ComputedStateInitReturn<T>
  : never

export type RefStateInitReturn<T> = T

export interface ComputedStateInitReturn<T> {
  getter: () => T
  setter: (value: T) => void
}

export type ComputedReadOnlyStateInitReturn<T> = {
  getter: () => T
}

export const initState = <T, ST extends StateType>(
  configUid: string,
  contextId: string,
  isConsole: boolean = false
) => {
  const internalContext = internalContextManager.get(contextId, isConsole)
  if (!internalContext) {
    return
  }
  const { stateManager } = internalContext
  const { isNeedInit } = stateManager
  if (!isNeedInit(configUid, isConsole)) {
    return
  }
  const internalDefineHelper = getInternalDefineHelperByContextUid(contextId)
  if (!internalDefineHelper) {
    return
  }
  const { stateConfigManager } = internalDefineHelper
  const config = stateConfigManager.get(configUid, isConsole)
  if (!config) {
    return
  }
  const {
    init,
    watchers = [],
    type
  } = config as DeepReadonlyWithUid<StateConfig<T, ST>>
  const context = exposeContext(internalContext)
  const stateInitFuncRes = init(context)
  let state: State<T, StateType> | undefined = undefined
  if (type === 'Ref') {
    state = ref(stateInitFuncRes as StateInitRes<T, 'Ref'>)
  }
  if (type === 'Computed') {
    const { getter } = stateInitFuncRes as StateInitRes<T, 'Computed'>
    state = computed(getter)
  }
  if (type === 'ComputedWritable') {
    const { getter, setter } = stateInitFuncRes as StateInitRes<
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
  return state as State<T, ST>
}
