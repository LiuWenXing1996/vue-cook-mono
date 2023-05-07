import { InternalContext } from '../../context/internalContext'
import { Equals, typeMustTrue } from '../../utils/utilityTypes'
import { RawState, RawStateDeclare } from './rawState'
import { ComputedState, ComputedStateDeclare } from './computedState'
import { RefState, RefStateDeclare } from './refState'
import { ShallowRefState, ShallowRefStateDeclare } from './shallowRefState'
import {
  WritableComputedState,
  WritableComputedStateDeclare
} from './writableComputedState'

export type StateType =
  | 'Raw'
  | 'Ref'
  | 'ShallowRef'
  | 'Computed'
  | 'WritableComputed'
// TODO实现这些状态
// Reactive 可能要在State里面单独占个类型，或者再把StateType再次细分下
//   | 'Reactive'
//   | 'ShallowReactive'

export type State<T, ST extends StateType> = StateTypeToStateMap<T>[ST]
export type StateTypeToStateMap<T> = {
  Raw: RawState<T>
  Ref: RefState<T>
  ShallowRef: ShallowRefState<T>
  Computed: ComputedState<T>
  WritableComputed: WritableComputedState<T>
}
typeMustTrue<Equals<keyof StateTypeToStateMap<any>, StateType>>(true)

export type StateConfig<
  T,
  ST extends StateType
> = StateTypeToStateConfigMap<T>[ST]

export type StateTypeToStateConfigMap<T> = {
  Raw: RawStateDeclare<T>['Config']
  Ref: RefStateDeclare<T>['Config']
  ShallowRef: ShallowRefStateDeclare<T>['Config']
  Computed: ComputedStateDeclare<T>['Config']
  WritableComputed: WritableComputedStateDeclare<T>['Config']
}
typeMustTrue<Equals<keyof StateTypeToStateConfigMap<any>, StateType>>(true)

export const createState = <T, ST extends StateType>(
  config: StateConfig<T, ST>,
  context: InternalContext
) => {
  const stateCreateFuncMap: Record<
    StateType,
    () => State<T, StateType> | undefined
  > = {
    Raw: () => {
      if (config.type === 'Raw') {
        return new RawState<T>(config, context)
      }
      return undefined
    },
    Ref: () => {
      if (config.type === 'Ref') {
        return new RefState<T>(config, context)
      }
      return undefined
    },
    ShallowRef: () => {
      if (config.type === 'ShallowRef') {
        return new ShallowRefState(config, context)
      }
      return undefined
    },
    Computed: () => {
      if (config.type === 'Computed') {
        return new ComputedState(config, context)
      }
      return undefined
    },
    WritableComputed: () => {
      if (config.type === 'WritableComputed') {
        return new WritableComputedState(config, context)
      }
      return undefined
    }
  }
  const func = stateCreateFuncMap[config.type]
  if (func) {
    return func()
  }
  return undefined
}
