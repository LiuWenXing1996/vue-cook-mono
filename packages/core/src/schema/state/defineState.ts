import {
  ComponentInternalInstance,
  ComputedRef,
  Ref,
  UnwrapRef,
  WritableComputedRef,
  getCurrentInstance
} from 'vue'
import type { IContext } from '../context/createContext'
import type { IStateInitFunction } from './initState'
import { deepFreeze } from '../../utils/deepFreeze'
import { Type } from '../../utils/types/type'

export type IStateType = 'Ref' | 'Computed' | 'ComputedWritable'

export interface IStateConfig<T = any, ST extends IStateType = IStateType> {
  name: string // TODO:移除这个名称的定义，直接使用文件名？？？？？，好像不行，这样的话useState找不到对应的数据了
  type: ST
  typeDefine: Type<T>
  expose?: boolean
  init: IStateInitFunction<T, ST>
  watchers?: IWatchConfig<T>[]
}

export type IWatchCallback<T> = (
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
  config: IStateConfig<T, ST>
) => deepFreeze(config)

export type IGetInit<T extends IStateConfig<any, any>> = ReturnType<T['init']>

export type IDefineState = typeof defineState
