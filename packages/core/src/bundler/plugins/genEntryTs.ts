// import { pascalCase } from 'pascal-case'
// import { IPlugin, defineMethodName } from '..'
// import {
//   IComponentConfig,
//   transformComponent,
//   transformComponentEntryTs
// } from '../../schema/component'
// import {
//   IPageConfig,
//   transformPage,
//   transformPageEntryTs
// } from '../../schema/page'

// export const genEntryTs = (): IPlugin => {
//   return {
//     name: 'genEntryTs',
//     bundleStart: async (options, helper) => {
//       const config = helper.getCookConfig()
//       const { join, relative, trimExtname } = helper.getPathUtils()
//       const vfs = helper.getVirtualFileSystem()
//       const componentConfigName =
//         config.component?.configName || 'component.config.json'
//       const pageConfigName = config.page?.configName || 'page.config.json'
//       if (componentConfigName === pageConfigName) {
//         throw new Error(
//           `componentConfigName和pageConfigName不可以一样，当前值：${componentConfigName}`
//         )
//       }
//       const exportComponents: Record<
//         string,
//         {
//           config: IComponentConfig
//           configPath: string
//           entryTsPath: string
//         }
//       > = {}
//       const exportPages: Record<
//         string,
//         {
//           config: IComponentConfig
//           configPath: string
//           entryTsPath: string
//         }
//       > = {}
//       const files = await vfs.readAllFiles()
//       for (const modulePath in files) {
//         if (modulePath.endsWith(componentConfigName)) {
//           const componentConfig = await vfs.readJson<IComponentConfig>(
//             modulePath
//           )
//           // TODO:校验componentConfig 的各个字段？？？
//           if (!componentConfig) {
//             throw new Error(`${modulePath} 包含的无效的json内容`)
//           }
//           const normalizeName = pascalCase(componentConfig.name)
//           if (normalizeName !== componentConfig.name) {
//             throw new Error(
//               `${modulePath} 的name格式不正确，应为${normalizeName},实为${componentConfig.name}`
//             )
//           }
//           const vueFile = {
//             path: '',
//             content: ''
//           }

//           const templateFile = {
//             path: '',
//             content: ''
//           }
//           if (componentConfig.template) {
//             templateFile.path = join(
//               modulePath,
//               '../',
//               componentConfig.template
//             )
//           }
//           if (templateFile.path) {
//             templateFile.content = (await vfs.readFile(templateFile.path)) || ''
//           }

//           const styleFiles: Record<string, string> = {}
//           if (componentConfig.styles) {
//             for (const stylePath in componentConfig.styles) {
//               const _stylePath = join(modulePath, '../', stylePath)
//               styleFiles[_stylePath] = (await vfs.readFile(_stylePath)) || ''
//             }
//           }

//           vueFile.path = join(modulePath, '../', 'index.vue')
//           vueFile.content = transformComponent(componentConfig)
//           await vfs.outputFile(vueFile.path, vueFile.content)

//           const entryTsFile = {
//             path: '',
//             content: ''
//           }
//           entryTsFile.path = join(
//             modulePath,
//             '../',
//             config.component?.entryTsName || 'entry.ts'
//           )
//           const realtiveVuePath =
//             './' + relative(entryTsFile.path + '/../', vueFile.path)
//           entryTsFile.content = transformComponentEntryTs({
//             config: componentConfig,
//             indexVuePath: realtiveVuePath
//           })
//           await vfs.outputFile(entryTsFile.path, entryTsFile.content)

//           if (componentConfig.export) {
//             const exportName =
//               componentConfig.exportName || componentConfig.name
//             const normalizeName = pascalCase(exportName)
//             if (normalizeName !== exportName) {
//               throw new Error(
//                 `${modulePath} 的exportName格式不正确，应为${normalizeName},实为${exportName}`
//               )
//             }
//             if (exportComponents[exportName]) {
//               throw new Error(
//                 `${modulePath}和${exportComponents[exportName].configPath}`
//               )
//             }
//             exportComponents[exportName] = {
//               config: componentConfig,
//               configPath: modulePath,
//               entryTsPath: entryTsFile.path
//             }
//           }
//         }
//         if (modulePath.endsWith(pageConfigName)) {
//           const pageConfig = await vfs.readJson<IPageConfig>(modulePath)
//           // TODO:校验componentConfig 的各个字段？？？
//           if (!pageConfig) {
//             throw new Error(`${modulePath} 包含的无效的json内容`)
//           }
//           const normalizeName = pascalCase(pageConfig.name)
//           if (normalizeName !== pageConfig.name) {
//             throw new Error(
//               `${modulePath} 的name格式不正确，应为${normalizeName},实为${pageConfig.name}`
//             )
//           }
//           const vueFile = {
//             path: '',
//             content: ''
//           }

//           const templateFile = {
//             path: '',
//             content: ''
//           }
//           if (pageConfig.template) {
//             templateFile.path = join(modulePath, '../', pageConfig.template)
//           }
//           if (templateFile.path) {
//             templateFile.content = (await vfs.readFile(templateFile.path)) || ''
//           }

//           const styleFiles: Record<string, string> = {}
//           if (pageConfig.styles) {
//             for (const stylePath in pageConfig.styles) {
//               const _stylePath = join(modulePath, '../', stylePath)
//               styleFiles[stylePath] = (await vfs.readFile(_stylePath)) || ''
//             }
//           }

//           vueFile.path = join(modulePath, '../', 'index.vue')
//           vueFile.content = transformPage(pageConfig)
//           await vfs.outputFile(vueFile.path, vueFile.content)

//           const entryTsFile = {
//             path: '',
//             content: ''
//           }
//           entryTsFile.path = join(
//             modulePath,
//             '../',
//             config.component?.entryTsName || 'entry.ts'
//           )
//           const realtiveVuePath =
//             './' + relative(entryTsFile.path + '/../', vueFile.path)
//           entryTsFile.content = transformPageEntryTs({
//             config: pageConfig,
//             indexVuePath: realtiveVuePath
//           })
//           await vfs.outputFile(entryTsFile.path, entryTsFile.content)

//           if (pageConfig.export) {
//             const exportName = pageConfig.exportName || pageConfig.name
//             const normalizeName = pascalCase(exportName)
//             if (normalizeName !== exportName) {
//               throw new Error(
//                 `${modulePath} 的exportName格式不正确，应为${normalizeName},实为${exportName}`
//               )
//             }
//             if (exportPages[exportName]) {
//               throw new Error(
//                 `${modulePath}和${exportPages[exportName].configPath}`
//               )
//             }
//             exportPages[exportName] = {
//               config: pageConfig,
//               configPath: modulePath,
//               entryTsPath: entryTsFile.path
//             }
//           }
//         }
//       }

//       const entryTsPath = join(config.root, config?.entryTsName || 'index.ts')
//       const entryTs = `${Object.keys(exportComponents)
//         .map(componentName => {
//           const component = exportComponents[componentName]
//           let realtivePath =
//             './' + relative(entryTsPath + '/../', component.entryTsPath)
//           realtivePath = trimExtname(realtivePath, ['.ts', '.js'])
//           return `import Component${componentName} from '${realtivePath}';`
//         })
//         .join('\n')}
// ${Object.keys(exportPages)
//   .map(pageName => {
//     const page = exportPages[pageName]
//     let realtivePath = './' + relative(entryTsPath + '/../', page.entryTsPath)
//     realtivePath = trimExtname(realtivePath, ['.ts', '.js'])
//     return `import Page${pageName} from '${realtivePath}';`
//   })
//   .join('\n')}
// const components = {
// ${Object.keys(exportComponents)
//   .map(componentName => {
//     return `  ${componentName}:Component${componentName}`
//   })
//   .join(',\n')}
// }

// const pages = {
// ${Object.keys(exportPages)
//   .map(pageName => {
//     return `  ${pageName}:Page${pageName}`
//   })
//   .join(',\n')}
// }

// export {
//   components,
//   pages
// }
//         `
//       await vfs.outputFile(entryTsPath, entryTs)
//     }
//   }
// }
