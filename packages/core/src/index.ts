import { registerDefineMethod } from './amd-loader'
registerDefineMethod()

export { run } from './lowcode'
export { build } from './bundler/index'
export { runContainer } from './lowcode'
// export { createContext } from './context/internalContext'
// export { createDefineHelper } from './context/internalHelper'
export { Number } from './utils/types/number'
export { Array } from './utils/types/array'
export type { ICookConfig } from './bundler/index'
export { require } from './amd-loader'
