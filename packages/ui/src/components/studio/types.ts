import type { VNodeChild } from 'vue'
import {
  type IBuildContext,
  type ILowcodeBuildContext,
  type IVirtulFileSystem
} from '@vue-cook/schema-bundler'
import { type IPath, type ISchemaData } from '@vue-cook/core'

export interface IPanelConfig {
  uid: string
  title: string
  content: () => VNodeChild
}

export interface IStudioState {
  vfs: IVirtulFileSystem
  path: IPath
  buildContext: ILowcodeBuildContext
  panelList: IPanelConfig[]
  currentPanelId: string
  currentEditFiles: {
    activeFilePath?: string
    files: string[]
  }
  schemaData?: ISchemaData
}
