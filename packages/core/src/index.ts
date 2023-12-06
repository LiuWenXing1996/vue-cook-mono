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
  getPkgJsonFromFs,
  getViewFilesFromFs,
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

export { exportDeps, type IDepMeta, type IDeps, type IDep, fetchDeps } from './utils/fetchDeps'

export {
  getMaterialList,
  type IMaterial,
  defineMaterial,
  type IMaterialWithDep
} from './design-mode/material'

// export {
//   createRenderContext,
//   type IRenderContext,
//   defineRender,
//   type IRenderData,
//   type IRenderMode
// } from './render/index'

export { type IViewContext, type IViewData } from './renderer/base-renderer'

export {
  type IDesignRenderer,
  type IDesignComponentOverlay,
  type IDesignComponentPageSize,
  createDesignRenderer,
  autoCreateDesignRenderer,
  getDesignRenderer,
  AbstractDesignRenderer
} from './renderer/design-renderer'

export {
  createRuntimeRenderer,
  autoCreateRuntimeRenderer,
  AbstractRuntimeRenderer
} from './renderer/runtime-renderer'

// export { emitEditorWindowSchemaChange, SchemaChanegeDataType } from './lowcode/schemaChange'

// export { createVueRenderContext, autoRunVueApp } from './lowcode/vueRender'
// export {
//   type IExportConfig as IExportSchemaConfig,
//   check as exportSchemaCheck,
//   transfer as exportSchemaTransfer
// } from './schema/export'
export { type IAttributeSchema } from './schema/attribute'
export { type ITemplateSchema } from './schema/template'
export { type IActionDataSchema, type IDataMapSchema } from './schema/data'

export { type IViewSchema, type IViewFileSchema } from './schema/view'
export {
  type ITemplateTreeTemplateNode as ITemplateTreeSchemaNode,
  templateSchemaToTree
} from './schema/template'
export { type IActionSchema, type IJsFunctionActionSchema, defineJsFunction } from './schema/action'

// export {
//   type IComponentConfig as IComponentSchemaConfig,
//   type ITemplateConfig,
//   type IView,
//   getEditorTypeUniName,
//   getComponetMap,
//   getStateMap,
//   removeTemplatePid,
//   type IEditor,
//   type IComponentMap,
//   type IStateSchemaMap,
//   type ITemplateConfigWithPid,
//   type IComponentConfigWithTemplatePid
//   // check as componentSchemaCheck,
//   // transformComponent as componentSchemaTransfer,
//   // transformComponentEntryTs
// } from './schema/component'

export { getLowcodeContextFromScript, type ILowcodeBundleData } from './renderer/lowcode-context'
