import type { IFs } from 'memfs'
import type { vol } from 'memfs'
import type { VNodeChild } from 'vue'
import { type IPath } from '@vue-cook/core'

export interface IPanelConfig {
  uid: string
  title: string
  content: () => VNodeChild
}

export interface IStudioState {
  fs: IFs
  path: IPath
  volume: typeof vol
  currentEditFiles: {
    activeFilePath?: string
    files: string[]
  }
}
