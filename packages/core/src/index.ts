import * as path from './utils/path'

export type IPath = typeof path
export { path }
export {
  createFsUtils,
  type IFsPromisesApi,
  type IFsUtils,
  createVfs,
  type IVirtulFileSystem
} from './utils/fs'
export {
  type ICookConfig,
  fillConfig,
  getCookConfigRelativePath,
  getCookConfigFromFs,
  type IPkgJson,
  type IDeepRequiredCookConfig,
  type ICookMaterialConfig,
  type ICookMeta
} from './utils/cookConfig'
export {
  createLowcodeContext,
  getLowcodeContext,
  ElementDataLowcodeContextIdKey,
  ElementDataCoreLibOnceGetterIdIdKey
} from './lowcode'

export {
  runRemotePlugin,
  defineRemotePlugin,
  type IRemotePlugin,
  type IRunRemotePluginConfig
} from './design-mode/remote-plugin'
export { exportDeps, type IDepMeta, type IDeps, type IDep, fetchDeps } from './utils/fetchDeps'

export {
  getMaterialList,
  type IMaterial,
  defineMaterial,
  type IMaterialWithDep
} from './design-mode/material'

export {
  createRenderContext,
  type IRenderContext,
  defineRender,
  type IRenderData,
  type IRenderMode
} from './render/index'

export {
  type IDesignRendererContext,
  type ISchemaData,
  type IDesignComponentOverlay,
  type IDesignComponentPageSize,
  createDesignRendererContext
} from './design-mode/design-renderer-context'

export {
  type IDesignRendererData,
  type IDesignRendererDataWatch,
  AbstractDesignRenderer
} from './design-mode/abstract-design-renderer'

export {
  type IEditorRendererContext,
  createEditorRendererContext
} from './design-mode/editor-renderer-context'

export {
  type IEditorRendererData,
  type IEditorRendererDataWatch,
  AbstractEditorRenderer
} from './design-mode/abstract-editor-renderer'

export { emitEditorWindowSchemaChange, SchemaChanegeDataType } from './lowcode/schemaChange'

export { createVueRenderContext, autoRunVueApp } from './lowcode/vueRender'
export {
  type IExportConfig as IExportSchemaConfig,
  check as exportSchemaCheck,
  transfer as exportSchemaTransfer
} from './schema/export'

// export {
//   type IPageConfig as IPageSchemaConfig,
//   check as pageSchemaCheck,
//   transformPage as pageSchemaTransfer,
//   transformPageEntryTs
// } from './schema/page'

export {
  type IComponentConfig as IComponentSchemaConfig,
  type ITemplateConfig,
  type IView,
  getEditorTypeUniName,
  getComponetMap,
  getStateMap,
  removeTemplatePid,
  type IEditor,
  type IComponentMap,
  type IStateMap,
  type ITemplateConfigWithPid,
  type IComponentConfigWithTemplatePid
  // check as componentSchemaCheck,
  // transformComponent as componentSchemaTransfer,
  // transformComponentEntryTs
} from './schema/component'
