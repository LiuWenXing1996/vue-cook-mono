import { deepFreeze } from '../../utils/deepFreeze'

export interface BaseConfig {
  name: string
}

export const defineBase = (config: BaseConfig) => deepFreeze(config)
