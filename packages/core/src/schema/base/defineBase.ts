import { deepFreeze } from '../../utils/deepFreeze'

export interface IBaseConfig {
  name: string
}

export const defineBase = (config: IBaseConfig) => deepFreeze(config)
