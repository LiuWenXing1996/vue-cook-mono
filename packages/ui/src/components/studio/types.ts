import type { VNodeChild } from 'vue'
import { type IPath, type IVirtulFileSystem } from '@vue-cook/core'

export interface IPanelConfig {
  uid: string
  title: string
  content: () => VNodeChild
}

export interface IStudioState {
  vfs: IVirtulFileSystem
  path: IPath
  currentEditFiles: {
    activeFilePath?: string
    files: string[]
  }
}
