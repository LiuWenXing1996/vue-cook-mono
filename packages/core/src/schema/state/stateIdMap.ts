import { DeepReadonly } from '../../utils/deepFreeze'
import { IState, IStateConfig, IStateType } from './defineState'

export interface IStateConfigId<T extends IState = IState> {
  id: string
  __onlyForStateType__: T
}

const stateConfigIdMap: Map<string, DeepReadonly<IStateConfig>> = new Map()

export const getStateConfig = <T, ST extends IStateType>(uid: string) => {
  return stateConfigIdMap.get(uid) as DeepReadonly<IStateConfig<T, ST>>
}

export const setStateConfig = (
  uid: string,
  config: DeepReadonly<IStateConfig>
) => {
  return stateConfigIdMap.set(uid, config)
}

export const createStateConfigId = <T extends IState>(uid: string) => {
  return {
    id: uid
  } as IStateConfigId<T>
}
