import { markRaw, reactive } from 'vue'
import type { IStudioState } from '../types'
import {
  path,
  createVfs,
  createBuildContext as _createBuildContext,
  type IVirtulFileSystem,
  installBrowserServer
} from '@vue-cook/core'
import { initEsbuild } from './esbuild'
import { initSwc } from './swc'
import * as VueCompiler from '@vue/compiler-sfc'

export const getExtName = (name: string) => {
  const allPathPoints = name.split('.')
  const extName = allPathPoints[allPathPoints.length - 1]
  return extName
}
export const getLanguage = (extName: string) => {
  const map: Record<string, string> = {
    ts: 'typescript',
    js: 'javascript',
    map: 'json',
    vue: 'html'
  }

  return map[extName] || extName
}

export const createStudioState = (config: {
  browserServerJsUrl: string
  scope: string
}): IStudioState => {
  const { browserServerJsUrl, scope } = config
  const vfs = createVfs()
  installBrowserServer(browserServerJsUrl, { vfs, scope })

  const state: IStudioState = {
    vfs: markRaw(vfs),
    path: markRaw({ ...path }),
    currentEditFiles: {
      files: []
    }
  }
  const stateRef = reactive(state) as IStudioState
  return stateRef
}

export const createBuildContext = async (options: { vfs: IVirtulFileSystem }) => {
  const esbuild = await initEsbuild()
  const swc = await initSwc()
  return _createBuildContext({
    vfs: options.vfs,
    env: 'browser',
    esbuild,
    swc,
    vueCompiler: VueCompiler
  })
}
