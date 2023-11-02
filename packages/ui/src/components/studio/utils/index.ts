import { markRaw, reactive, ref } from 'vue'
import type { IStudioServices, IStudioState } from '../types'
import { path, createVfs, type IVirtulFileSystem } from '@vue-cook/core'

// TODO:收敛不暴露出去
export const createStudioState = async (config: {
  vfs: IVirtulFileSystem
  services: IStudioServices
  projectName: string
}): Promise<IStudioState> => {
  const { vfs, services, projectName } = config

  const state: IStudioState = {
    vfs: markRaw(vfs),
    splitPanelConfig: { list: [] },
    services: markRaw(services),
    tabsLayout: { list: [] },
    schemaData: undefined,
    projectName,
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
