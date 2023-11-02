import type { VNodeChild } from 'vue'
import { type IPath, type ISchemaData, type IVirtulFileSystem } from '@vue-cook/core'
import type { ITabsLayoutVerticalProps } from './components/tabs-layout-vertical.vue'

export interface IPanelConfig {
  uid: string
  title: string
  content: () => VNodeChild
}

export interface ITab {
  key: string
  title: string
  content: () => VNodeChild
}
export interface ITabContaienr {
  list: ITab[]
  currentKey: string
}

export interface IVerticalTabContaienrLayout {
  list: ITabContaienr | IHorizontalTabContaienrLayout[]
}

export interface IHorizontalTabContaienrLayout {
  list: ITabContaienr | IVerticalTabContaienrLayout[]
}

export interface ISplitPanelConfig {
  list: IPanelConfig[]
  left?: ISplitPanelConfig
  bootom?: ISplitPanelConfig
}

export interface IStudioServices {
  getRemotePluginEntry: (params: { projectName: string }) => Promise<{
    js: string
    css: string
  }>
  getDesignDepsEntry: (params: { projectName: string }) => Promise<{
    js: string
    css: string
  }>
  getRuntimeDepsEntry: (params: { projectName: string }) => Promise<{
    js: string
    css: string
  }>
}

export interface IStudioState {
  projectName: string
  vfs: IVirtulFileSystem
  path: IPath
  services: IStudioServices
  splitPanelConfig: ISplitPanelConfig
  tabsLayout: ITabsLayoutVerticalProps
  panelList: IPanelConfig[]
  currentPanelId: string
  currentEditFiles: {
    activeFilePath?: string
    files: string[]
  }
  schemaData?: ISchemaData
}
