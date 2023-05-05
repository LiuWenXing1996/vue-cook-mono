import { RawState, RawStateDeclare } from './rawState'
import { RefState, RefStateDeclare } from './refState'
import { ShallowRefState, ShallowRefStateDeclare } from './shallowRefState'

export type StateType = 'Raw' | 'Ref' | 'ShallowRef'
// TODO实现这些状态
//   | 'Reactive'
//   | 'ShallowReactive'
//   | 'Computed'
//   | 'ComputedWritable'

export type State<T = any> = RawState<T> | RefState<T> | ShallowRefState<T>

export type StateConfig<T = any> =
  | RawStateDeclare<T>['Config']
  | RefStateDeclare<T>['Config']
  | ShallowRefStateDeclare<T>['Config']

export const createState = () => {
  // TODO:根据不同的类型创建不同的状态
}
