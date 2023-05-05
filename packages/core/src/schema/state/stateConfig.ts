import type { ComputedRef, Ref, UnwrapRef, WritableComputedRef } from 'vue'
import type { StateInitFunction } from './initState'
import { DeepReadonlyWithUid, deepFreeze } from '../../utils/deepFreeze'
import { Type } from '../../utils/types/type'
import { DefineConfigBase } from '../context/defineHelperManager'
import { Context } from '../context/contextManager'
import { createResourceManager } from '../../utils/resourceManager'
import { createTypeUid } from '../../utils/typeUid'

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

export type State<
  T = any,
  ST extends StateType = StateType
> = ST extends 'Ref'
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
