import { markRaw, reactive, ref } from 'vue'
import type { IStudioState } from '../types'
import { path } from '@vue-cook/core'
import { initEsbuild } from './esbuild'
import { initSwc } from './swc'
import {
  createVfs,
  createLowcodeBuildContext,
  type IVirtulFileSystem,
  type ILowcodeContextConfig
} from '@vue-cook/schema-bundler'

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

export const createStudioState = async (config: {
  vfs: IVirtulFileSystem
}): Promise<IStudioState> => {
  const { vfs } = config
  const buildContext = await createBuildContext({
    vfs,
    onBuildEnd: (res) => {
      console.log('....')
      const { outputFiles = {} } = res
      const outputFileArray = Object.values(outputFiles)
      const js = (outputFileArray.find((e) => e.type == 'js')?.content || '') as string
      const css = (outputFileArray.find((e) => e.type == 'css')?.content || '') as string
      stateRef.schemaData = {
        timestamp: res.timestamp,
        schema: {
          js: js,
          css: css
        }
      }
    }
  })

  const state: IStudioState = {
    vfs: markRaw(vfs),
    schemaData: undefined,
    buildContext: markRaw(buildContext),
    path: markRaw({ ...path }),
    panelList: [],
    currentPanelId: '',
    currentEditFiles: {
      files: []
    }
  }
  const stateRef = reactive(state) as IStudioState
  return stateRef
}

export const createBuildContext = async (options: {
  vfs: IVirtulFileSystem
  onBuildEnd?: ILowcodeContextConfig['onBuildEnd']
}) => {
  const esbuild = await initEsbuild()
  const swc = await initSwc()
  return createLowcodeBuildContext({
    vfs: options.vfs,
    env: 'browser',
    esbuild,
    swc,
    watch: true,
    onBuildEnd: options.onBuildEnd
  })
}
