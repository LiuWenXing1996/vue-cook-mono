import { markRaw, reactive } from 'vue'
import type { IStudioState } from '../types'
import { Volume, createFsFromVolume } from 'memfs'
import { path, createVfs } from '@vue-cook/core'

export const getExtName = (name: string) => {
  const allPathPoints = name.split('.')
  const extName = allPathPoints[allPathPoints.length - 1]
  return extName
}
export const getLanguage = (extName: string) => {
  const map: Record<string, string> = {
    ts: 'typescript',
    js: 'javascript',
    map: 'json'
  }

  return map[extName] || extName
}

export const createStudioState = (): IStudioState => {
  const vfs = createVfs()
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
