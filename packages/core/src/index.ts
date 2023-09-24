import { registerDefineMethod } from './amd-loader'
registerDefineMethod()
import * as path from '@/bundler/utils/path'
export { run } from './lowcode'
export { build, defineMethodName } from './bundler/index'
export { createVfs } from './bundler/utils/fs'
export { createBuildContext } from './bundler/index'
export type { IEsbuild, ISwc, IBuildContext } from './bundler/index'
export type { IVirtulFileSystem } from './bundler/utils/fs'
export { runContainer } from './lowcode'
// export { createContext } from './context/internalContext'
// export { createDefineHelper } from './context/internalHelper'
export type { ICookConfig } from './bundler/index'
export type IPath = typeof path
export { require } from './amd-loader'
export { path }
export { installBrowserServer, MessageType } from './utils/installBrowserServer'
export type {
  ICallFsMethodData,
  ICallFsMethodReturns,
  IMessageRecived,
  IMessageSend
} from './utils/installBrowserServer'
