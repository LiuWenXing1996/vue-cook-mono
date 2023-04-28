import type { ComputedRef, Ref, UnwrapRef, WritableComputedRef } from 'vue'
import type { IStateInitFunction } from './initState'
import { deepFreeze } from '../../utils/deepFreeze'
import { Type } from '../../utils/types/type'
import { IBaseDefineConfig } from '../context/defineHelperManager'
import { IContext } from '../context/contextManager'

export type IStateType = 'Ref' | 'Computed' | 'ComputedWritable'

export interface IStateConfig<T = any, ST extends IStateType = IStateType>
  extends IBaseDefineConfig {
  type: ST
  typeDefine: Type<T>
  expose?: boolean
  init: IStateInitFunction<T, ST>
  watchers?: IWatchConfig<T>[]
}

export type IWatchCallback<T> = (
  context: IContext,
  value: UnwrapRef<T> | T,
  oldValue: UnwrapRef<T> | T | undefined,
  onCleanup: (cleanupFn: () => void) => void,
  stopHandler: () => void
) => void

export interface IWatchConfig<T> {
  callback: IWatchCallback<T>
  immediate?: boolean // 默认：false
  deep?: boolean // 默认：false
  flush?: 'pre' | 'post' | 'sync' // 默认：'pre'
}

export type IState<
  T = any,
  ST extends IStateType = IStateType
> = ST extends 'Ref'
  ? Ref<UnwrapRef<T>>
  : ST extends 'Computed'
  ? ComputedRef<T>
  : ST extends 'ComputedWritable'
  ? WritableComputedRef<T>
  : never
export type IStateMap = Map<string, IState | undefined>

export const defineState = <T, ST extends IStateType = IStateType>(
  config: Omit<IStateConfig<T, ST>, 'name'>
) => deepFreeze(config)

export type IGetInit<T extends IStateConfig<any, any>> = ReturnType<T['init']>

export type IDefineState = typeof defineState
