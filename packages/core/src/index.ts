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
  type IPkgJson,
  type IDeepRequiredCookConfig,
  type ICookMaterialConfig,
  type ICookMeta
} from './utils/cookConfig'
export {
  createLowcodeContext,
  getLowcodeContext,
  ElementDataLowcodeContextIdKey,
  ElementDataCoreLibOnceGetterIdIdKey,
  type ISchemaData
} from './lowcode'

export {
  runRemotePlugin,
  defineRemotePlugin,
  type IRemotePlugin,
  type IRunRemotePluginConfig
} from './design-mode/remote-plugin'
export { exportDeps, type IDepMeta, type IDeps, fetchDeps } from './utils/fetchDeps'

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
  defineView,
  type IView,
  getViewList,
  getComponentTypeUniName,
  getEditorTypeUniName,
  type IEditor
  // check as componentSchemaCheck,
  // transformComponent as componentSchemaTransfer,
  // transformComponentEntryTs
} from './schema/component'
