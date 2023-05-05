import { Context, InternalContext } from '../../context/internalContext'
import { StateType } from './state'

export interface StateTypeRequireDeclare<
  OriginalValueType,
  ValueType,
  TheStateType extends StateType,
  InitReturnType,
  Config extends BaseStateConfig<TheStateType, InitReturnType>
> {
  OriginalValueType: OriginalValueType
  ValueType: ValueType
  TheStateType: TheStateType
  InitReturnType: InitReturnType
  Config: Config
}

export abstract class BaseState<
  ValueType,
  TheStateType extends StateType,
  InitReturnType,
  Config extends BaseStateConfig<TheStateType, InitReturnType>
> {
  resourceName: string
  type: TheStateType
  value: ValueType | undefined
  config: Config
  context: InternalContext
  constructor (config: Config, context: InternalContext) {
    const { resourceName } = config
    this.resourceName = resourceName
    this.config = config
    this.context = context
    this.type = this.getType()
    this.value = this.initState()
  }
  abstract getType(): TheStateType
  abstract initState(): ValueType
}

export interface BaseStateConfig<
  TheStateType extends StateType,
  InitReturnType
> {
  resourceName: string
  type: TheStateType
  init: (context: Context) => InitReturnType
}
