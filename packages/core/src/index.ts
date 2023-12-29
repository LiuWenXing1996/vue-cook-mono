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
export { type ILowcodeRunResult } from './renderer/lowcode-context'

export { exportDeps, type IDepMeta, type IDeps, type IDep, fetchDeps } from './utils/fetchDeps'

export {
  getMaterialList,
  type IMaterial,
  defineMaterial,
  type IMaterialWithDep
} from './design-mode/material'

export { type IViewData } from './renderer/view-data'
export { type IViewContext } from './renderer/view-context'
export {
  type IRenderer,
  createRenderer,
  autoCreateRenderer,
  AbstractRenderer
} from './renderer/abstract-renderer'

export {
  type IRendererApp,
  type IViewOverlay,
  type IViewRect,
  AbstractRendererApp
} from './renderer/abstract-renderer-app'

export { type IAttributeSchema } from './schema/attribute'
export { type ITemplateSchema } from './schema/template'
export { type IActionDataSchema, type IDataMapSchema } from './schema/data'

export {
  type IViewSchema,
  type IViewFileSchema,
  type IPageViewSchema,
  type IComponentViewSchema,
  type ILayoutViewSchema
} from './schema/view'
export {
  type ITemplateTreeTemplateNode as ITemplateTreeSchemaNode,
  templateSchemaToTree,
  templateParser
} from './schema/template'
export { type IActionSchema, type IJsFunctionActionSchema, defineJsFunction } from './schema/action'

export { getLowcodeContextFromScript, type ILowcodeBundleData } from './renderer/lowcode-context'
