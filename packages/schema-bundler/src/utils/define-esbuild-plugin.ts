import type { IVirtulFileSystem } from './fs'
import type { Plugin as IEsbuildPlugin, Loader } from 'esbuild'
export const defineEsbuildPlugin = (p: (params: { vfs: IVirtulFileSystem }) => IEsbuildPlugin) => p
