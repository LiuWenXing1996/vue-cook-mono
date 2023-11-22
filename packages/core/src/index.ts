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

export {
  type IDesignRendererContext,
  type IDesignComponentOverlay,
  type IDesignComponentPageSize,
  createDesignRendererContext,
  autoCreateDesignRendererContext,
  getDesignRendererContext,
  AbstractDesignRenderer
} from './renderer/design-renderer'

// export { emitEditorWindowSchemaChange, SchemaChanegeDataType } from './lowcode/schemaChange'

// export { createVueRenderContext, autoRunVueApp } from './lowcode/vueRender'
// export {
//   type IExportConfig as IExportSchemaConfig,
//   check as exportSchemaCheck,
//   transfer as exportSchemaTransfer
// } from './schema/export'

export { type IViewSchema, type IViewFileSchema } from './schema/view'
export {
  type ITemplateTreeSchemaNode,
  type ITemplateTextSchema,
  type ITemplateTagSchema,
  templateSchemaToTree
} from './schema/template'
export { type IActionSchema, type IJsFunctionActionSchema } from './schema/action'

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
