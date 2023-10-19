import * as path from './utils/path'

export type IPath = typeof path
export { path }
export { createFsUtils, type IFsPromisesApi, type IFsUtils } from './utils/fs'
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
  type IRemotePlugin
} from './design-mode/remote-plugin'
export { exportDeps, type IDepMeta } from './utils/fetchDeps'

export { emitEditorWindowSchemaChange, SchemaChanegeDataType } from './lowcode/schemaChange'

export { createVueRenderContext, autoRunVueApp } from './lowcode/vueRender'
export {
  type IExportConfig as IExportSchemaConfig,
  check as exportSchemaCheck,
  transfer as exportSchemaTransfer
} from './schema/export'

export {
  type IPageConfig as IPageSchemaConfig,
  check as pageSchemaCheck,
  transformPage as pageSchemaTransfer,
  transformPageEntryTs
} from './schema/page'

export {
  type IComponentConfig as IComponentSchemaConfig,
  check as componentSchemaCheck,
  transformComponent as componentSchemaTransfer,
  transformComponentEntryTs
} from './schema/component'
