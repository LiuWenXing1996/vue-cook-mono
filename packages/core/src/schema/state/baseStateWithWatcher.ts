import { WatchStopHandle, watch } from 'vue'
import {
  Context,
  InternalContext,
  exposeContext
} from '../../context/internalContext'
import {
  BaseState,
  BaseStateConfig,
  StateTypeRequireDeclare
} from './baseState'
import { StateType } from './state'

export interface StateWithWatcherTypeRequireDeclare<
  OriginalValueType,
  ValueType,
  TheStateType extends StateType,
  InitReturnType,
  WatchCallbackValueType,
  Config extends BaseStateConfigWithWatcher<
    TheStateType,
    InitReturnType,
    WatchCallbackValueType
  >
> extends StateTypeRequireDeclare<
    OriginalValueType,
    ValueType,
    TheStateType,
    InitReturnType,
    Config
  > {
  WatchCallbackValueType: WatchCallbackValueType
}

export abstract class BaseStateWithWatcher<
  ValueType,
  TheStateType extends StateType,
  InitReturnType,
  WatchCallbackValueType,
  Config extends BaseStateConfigWithWatcher<
    TheStateType,
    InitReturnType,
    WatchCallbackValueType
  >
> extends BaseState<ValueType, TheStateType, InitReturnType, Config> {
  constructor (config: Config, context: InternalContext) {
    super(config, context)
    this.bindWatcher()
  }
  bindWatcher (): void {
    const { value, config, context } = this
    const { watchers = [] } = config
    if (value) {
      const anyValue = value as any
      watchers.forEach(watcher => {
        const { deep, immediate, flush } = watcher
        const stopHandler: WatchStopHandle = watch(
          anyValue,
          (newValue, oldValue, cleanupFn) => {
            return watcher.callback(
              exposeContext(context),
              newValue,
              oldValue,
              cleanupFn,
              stopHandler
            )
          },
          {
            deep,
            immediate,
            flush
          }
        )
      })
    }
  }
}

export interface BaseStateConfigWithWatcher<
  TheStateType extends StateType,
  InitReturnType,
  WatchCallbackValueType
> extends BaseStateConfig<TheStateType, InitReturnType> {
  watchers?: WatchConfig<WatchCallbackValueType>[]
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
