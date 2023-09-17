import { registerDefineMethod } from './amd-loader'
registerDefineMethod()
import * as path from '@/bundler/utils/path'

export { run } from './lowcode'
export { build, defineMethodName } from './bundler/index'
export { runContainer } from './lowcode'
// export { createContext } from './context/internalContext'
// export { createDefineHelper } from './context/internalHelper'
export type { ICookConfig } from './bundler/index'
export type IPath = typeof path
export { require } from './amd-loader'
export { path }
