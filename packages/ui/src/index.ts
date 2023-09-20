//TODO:增加黑色主题和主题色定义功能
//TODO：单元测试

// components
export { default as CookEditor } from './components/cook-editor/index.vue'
export { default as CookPlayer } from './components/cook-player/index.vue'
export { default as ComponentDragger } from './components/component-dragger/index.vue'
export { default as LogicDragger } from './components/logic-dragger/index.vue'
export { default as ResourceMaker } from './components/resource-maker/index.vue'
export { default as Studio } from './components/studio/index.vue'
// panel makers
export { default as PageComponentTreeMaker } from '@/built-in-resources/panels/page-component-tree'
export { default as PageEditorMaker } from '@/built-in-resources/panels/page-editor'
export { default as ComponentEditorMaker } from '@/built-in-resources/panels/component-editor'
export { default as ResourcePanelMaker } from '@/built-in-resources/panels/resource-panel'
// component makers
export { default as RootAppMaker } from '@/built-in-resources/components/root-app'
// hooks
export { default as useComponentFocused } from './hooks/useComponentFocused'
export { default as useComponentMaker } from './hooks/useComponentMaker'
export { default as useComponentMakerList } from './hooks/useComponentMakerList'
export { default as useComponentPickerEnable } from './hooks/useComponentPickerEnable'
export { default as useComponentSelected } from './hooks/useComponentSelected'
export { default as useLogicMaker } from './hooks/useLogicMaker'
export { default as useLogicMakerList } from './hooks/useLogicMakerList'
export { default as usePageEditingUidList } from './hooks/usePageEditingUidList'
export { default as usePanelMaker } from './hooks/usePanelMaker'
export { default as usePanelMakerList } from './hooks/usePanelMakerList'
export { default as useSlotOptions } from './hooks/useSlotOptions'
// utils
export { default as addComponentConfig } from './utils/addComponentConfig'
export { default as createCookEditorState } from './utils/createCookEditorState'
export { default as createCookPlayerState } from './utils/createCookPlayerState'
export { default as defaultMakerList } from './utils/defaultMakerList'
export { default as defaultSplitLayout } from './utils/defaultSplitLayout'
export { default as defineComponentMaker } from './utils/defineComponentMaker'
export { default as defineLogicMaker } from './utils/defineLogicMaker'
export { default as definePanelMaker } from './utils/definePanelMaker'
export { default as findComponentConfig } from './utils/findComponentConfig'
export { default as findPanelConfig } from './utils/findPanelConfig'
export { default as isLogicConfig } from './utils/isLogicConfig'
export { default as layoutAddTab } from './utils/layoutAddTab'
export { default as layoutRemoveTab } from './utils/layoutRemoveTab'
export { default as logicRun } from './utils/logic-run'
export { default as makeDefaultComponentConfig } from './utils/makeDefaultComponentConfig'
export { default as makeDefaultLogicConfig } from './utils/makeDefaultLogicConfig'
export { default as makeDefaultPanelConfig } from './utils/makeDefaultPanelConfig'
export { default as parseLogicConfig } from './utils/parseLogicConfig'
export { default as removeComponentConfig } from './utils/removeComponentConfig'
export { createStudioState } from './components/studio/utils/index'
// types
export type { default as IComponentConfig } from './types/IComponentConfig'
export type { default as IComponentMaker } from './types/IComponentMaker'
export type { default as IComponentOverlay } from './types/IComponentOverlay'
export type { default as IComponentSelected } from './types/IComponentSelected'
export type { default as ICookEditorState } from './types/ICookEditorState'
export type { default as ICookPlayerState } from './types/ICookPlayerState'
export type { default as ICookState } from './types/ICookState'
export type { default as ICookStateBase } from './types/ICookStateBase'
export type { default as ICookStateType } from './types/ICookStateType'
export type { default as ILogicConfig } from './types/ILogicConfig'
export type { default as ILogicMaker } from './types/ILogicMaker'
export type { default as IPage } from './types/IPage'
export type { default as IPageCookPanelSize } from './types/IPageCookPanelSize'
export type { default as IPanelConfig } from './types/IPanelConfig'
export type { default as IPanelMaker } from './types/IPanelMaker'
export type { default as IResourceConfig } from './types/IResourceConfig'
export type { default as IResourceConfigBase } from './types/IResourceConfigBase'
export type { default as IResourceMaker } from './types/IResourceMaker'
export type { default as IResourceMakerBase } from './types/IResourceMakerBase'
export type { default as IResourceMakerType } from './types/IResourceMakerType'
export type { default as ISplitLayout } from './types/ISplitLayout'
export type { default as ISplitLayoutPaneName } from './types/ISplitLayoutPaneName'
export type { default as ISplitPaneConfig } from './types/ISplitPaneConfig'