import type { ICookConfig, IDeepRequiredCookConfig } from '@vue-cook/core'
import type { IVirtulFileSystem } from './fs'
import type { Plugin as IEsbuildPlugin, Loader } from 'esbuild'
export const defineEsbuildPlugin = (
  p: (params: { vfs: IVirtulFileSystem; cookConfig: IDeepRequiredCookConfig }) => IEsbuildPlugin
) => p
