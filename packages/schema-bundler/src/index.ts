// export { createBuildContext, type IBuildContext } from './bundler/build'
// export type { IOutCssFile, IOutJsFile, IOutOtherFile, IOutMapFile } from './bundler/build'
// export {
//   createLowcodeBuildContext,
//   type ILowcodeBuildContext,
//   type ILowcodeContextConfig
// } from './lowcode/build'
export { createVfs, type IVirtulFileSystem } from './utils/fs'
export type { ISchemaParser } from './lowcode/plugins/schemaToCode'
// TODO:测试build 是否成功
export { build, type IEsbuild, type ISwc } from './build/index'
