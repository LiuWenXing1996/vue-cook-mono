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
  getViewSchemaFilePathListFromFs,
  type IPkgJson,
  type IDeepRequiredCookConfig,
  type ICookMaterialConfig,
  type ICookMeta
} from './utils/cookConfig'
export {
  createLowcodeContext,
  // getLowcodeContext,
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
export {
  type IViewContext,
  ViewContext,
  defineViewContext,
  type IActions,
  type IStates
} from './renderer/view-context'
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

export { type IAction, bindAction, defineAction, defineAsyncAction } from './schema/action'

export {
  type IViewSchema,
  type IViewSchemaFile,
  type IPageViewSchema,
  type IComponentViewSchema,
  type ILayoutViewSchema,
  viewSchemaParser,
  viewSchemaToCode
} from './schema/view'
export { type IContext, Context, defineContext, contextSchemaToCode } from './schema/context'
export {
  type ITemplateTreeTemplateNode as ITemplateTreeSchemaNode,
  templateSchemaToTree,
  templateSchemaParser,
  templateSchemaToTsxTemplate
} from './schema/template'
export { exportSchemaToCode } from './schema/export'
// export { type IActionSchema, type IJsFunctionActionSchema } from './schema/action'

export { getLowcodeContextFromScript, type ILowcodeBundleData } from './renderer/lowcode-context'

export { cjsWrapperLoadWrapperJs, CjsWrapperBanner, CjsWrapperFooter } from './utils/cjs-wrapper'

export { autoLoadSchema, loadSchema } from './utils/schema-loader'

// 设计态是一个Render：tpl+css
// 预览态是一个Render：tpl+css+js（这个地方走的也是前端构建，那源码的sourcemap怎么注入呢？，不然不好调试的）
// 发布态的资源和预览态的资源是一致的，js的执行也是通过sandbox来的
// 要保持预览态和发布态的东西是一致的，这很重要
// 发布时直接将预览的前端资源上传？（那sourcemap的问题，还有就是minify的问题）
// 那这样的话，就前端构建器直接可以构建生产和开发两种资源模式
// 依赖也是会有两种模式
// 或者同时会构建两种资源，依赖和schema的构建都是，这样的话，可以选择在预览的时候使用，开发和生产的资源，然后发布的时候也可以选择开发还是生产的资源？
// 甚至于对这个模式的是不做限制的，可以使用自定义的模式？
// 但是，被嵌入使用这个东西怎么弄呢？
