import {
  Context,
  exposeContext,
  internalContextManager
} from '../context/contextManager'
import {
  DefineConfigBase,
  getInternalDefineHelperByContextUid
} from '../context/defineHelperManager'
import { RefStateInitReturn } from '../state'
import {
  RawState,
  RawStateConfig,
  RawStateType,
  initRawState
} from './rawState'
import {
  RefStateType,
  RefState,
  RefStateConfig,
  initRefState
} from './refState'
import {
  ShallowRefState,
  ShallowRefStateConfig,
  ShallowRefStateType,
  initShallowRefState
} from './shallowRefState'

export type StateType = RawStateType | RefStateType | ShallowRefStateType
// TODO实现这些状态
//   | 'Reactive'
//   | 'ShallowReactive'
//   | 'Computed'
//   | 'ComputedWritable'

export interface StateConfigBase<T, ST extends StateType>
  extends DefineConfigBase {
  type: ST
  init: StateInitFunction<T, ST>
}

export interface WatchConfig<T> {
  callback: WatchCallback<T>
  immediate?: boolean // 默认：false
  deep?: boolean // 默认：false
  flush?: 'pre' | 'post' | 'sync' // 默认：'pre'
}

export type WatchCallback<T> = (
  context: Context,
  value: T | undefined,
  oldValue: T | undefined,
  onCleanup: (cleanupFn: () => void) => void,
  stopHandler: () => void
) => void

export type StateInitFunction<T, ST extends StateType> = (
  context: Context
) => StateInitRes<T, ST>

export type StateInitRes<T, ST extends StateType> = ST extends 'Ref'
  ? RefStateInitReturn<T>
  : never

export type StateConfig<
  T = any,
  ST extends StateType = StateType
> = ST extends RawStateType
  ? RawStateConfig<T>
  : ST extends RefStateType
  ? RefStateConfig<T>
  : never

// export type State<
//   T = any,
//   ST extends StateType = StateType
// > = ST extends RawStateType
//   ? RawState<T>
//   : ST extends RefStateType
//   ? RefState<T>
//   : ST extends ShallowRefStateType
//   ? ShallowRefState<T>
//   : never

export type State<T = any> = RefState<T> | ShallowRefState<T>

const initStateFuncMap: Record<
  StateType,
  <T>(config: StateConfig<T>, context: Context) => State<T>
> = {
  Raw: <T>(config: StateConfig<T>, context: Context) =>
    initRawState(config as RawStateConfig<T>, context),
  Ref: <T>(config: StateConfig<T>, context: Context) =>
    initRefState(config as RefStateConfig<T>, context),
  ShallowRef: <T>(config: StateConfig<T>, context: Context) =>
    initShallowRefState(config as ShallowRefStateConfig<T>, context)
}

export const initState = <T, ST extends StateType>(
  configUid: string,
  contextUid: string
) => {
  const internalContext = internalContextManager.get(contextUid)
  if (!internalContext) {
    return
  }
  const { stateManager } = internalContext
  const { isNeedInit } = stateManager
  if (!isNeedInit(configUid)) {
    return
  }
  const internalDefineHelper = getInternalDefineHelperByContextUid(contextUid)
  if (!internalDefineHelper) {
    return
  }
  const { stateConfigManager } = internalDefineHelper
  const config = stateConfigManager.get(configUid)
  if (!config) {
    return
  }
  const { type } = config
  const context = exposeContext(internalContext)
  const state = initStateFuncMap[type](config, context)
  if (!stateManager.isInited(configUid)) {
    stateManager.set(configUid, state)
  }
  return state as State<T, ST>
}
