// import type * as esbuild from 'esbuild'
// import { FsPlugin } from './plugins/FsPlugin'
// import type * as swc from '@swc/core'
// import { pascalCase } from 'pascal-case'
// import { join, relative, isAbsolute } from 'path-browserify'
// import { Vue } from './plugins/vue'
// import type * as vueCompiler from '@vue/compiler-sfc'
// import { IVirtulFileSystem, VirtulFileSystem } from './fs'
// import type * as IPathUtils from './path'
// import { genDefaultOptions } from './plugins/genDefaultOptions'

// const isSubPath = (parent: string, dir: string) => {
//   const relativePath = relative(parent, dir)
//   return (
//     relativePath && !relativePath.startsWith('..') && !isAbsolute(relativePath)
//   )
// }

// export interface IPkgJson {
//   dependencies: Record<string, string>
//   cookConfigJson?: string
// }

// export interface IPluginHelper {
//   getPackageJson: () => IPkgJson
//   getCookConfig: () => ICookConfig
//   getVirtualFileSystem: () => IVirtulFileSystem
//   getPathUtils: () => typeof IPathUtils
//   getEnv: () => IBuildOptions['env']
// }

// export interface IMinifyOptions {
//   css: esbuild.TransformOptions
//   js: esbuild.TransformOptions
// }

// export interface IPlugin {
//   name: string
//   buildStart?: (
//     options: esbuild.BuildOptions,
//     helper: IPluginHelper
//   ) => Partial<esbuild.BuildOptions> | Promise<Partial<esbuild.BuildOptions>>
//   transformStart?: (
//     options: esbuild.BuildOptions,
//     helper: IPluginHelper
//   ) => Partial<swc.Options> | Promise<Partial<swc.Options>>
//   minifyStart?: (
//     options: IMinifyOptions,
//     helper: IPluginHelper
//   ) => Partial<IMinifyOptions> | Promise<Partial<IMinifyOptions>>
// }

// export interface ICookConfig {
//   root: string
//   entryTsName?: string
//   component?: {
//     configJsonName?: string
//     entryTsName?: string
//   }
//   page?: {
//     configJsonName?: string
//     entryTsName?: string
//   }
//   ignorePaths: string[]
//   outdir: string
//   minify?: boolean
//   tempDir?: string
//   deps?: Record<
//     string,
//     {
//       entry: string
//     }
//   >
// }

// export interface IBuildOptions {
//   env: 'node' | 'browser'
//   files: Record<string, string>
//   plugins: IPlugin[]
//   esbuild: typeof esbuild
//   swc: typeof swc
//   vueCompiler: typeof vueCompiler
// }

// export const defineMethodName = '__vueCookAmdDefine__'

// const runPlugin = async (
//   plugin: IPlugin,
//   options: {
//     esbuildBuildOptions: esbuild.BuildOptions
//     swcTransformOptions: swc.Options
//     esbuildMinifyJsOptions: esbuild.TransformOptions
//     esbuildMinifyCssOptions: esbuild.TransformOptions
//     helper: IPluginHelper
//   }
// ) => {
//   const { name } = plugin
//   try {
//     await plugin?.esbuildBuildOptions?.()
//   } catch (error) {
//     console.log(name, error)
//   }
// }

// export const build = async (options: IBuildOptions) => {
//   const { esbuild, files, swc, vue, plugins } = options
//   const vfs = new VirtulFileSystem(files)
//   const pkgJson = await vfs.readJson<IPkgJson>('package.json')
//   if (!pkgJson) {
//     return
//   }
//   const configJsonPath = pkgJson.cookConfigJson || 'cook.config.json'
//   const config = await vfs.readJson<ICookConfig>(configJsonPath)
//   if (!config) {
//     return
//   }
//   let currentOptions: {
//     esbuildBuildOptions: esbuild.BuildOptions
//     swcTransformOptions: swc.Options
//     esbuildMinifyJsOptions: esbuild.TransformOptions
//     esbuildMinifyCssOptions: esbuild.TransformOptions
//   } = {
//     // TODO:实现run plugin
//   }
//   let esbuildBuildOptions = {}
//   let swcTransformOptions = {}
//   let esbuildMinifyJsOptions = {}
//   let esbuildMinifyCssOptions = {}

//   // build-in pre-plugins

//   // user plugins

//   // build-in post-plugins

//   let { root } = config
//   const { dependencies = {} } = pkgJson
//   const entryTsPath = join(root, config.entryFileName)
//   const componentsPath = join(root, config.componentFileName)
//   const components: Record<
//     string,
//     {
//       path: string
//     }
//   > = {}
//   const pagesPath = join(root, config.pageFileName)
//   const pages: Record<
//     string,
//     {
//       path: string
//     }
//   > = {}
//   Object.keys(files).map(modulePath => {
//     if (modulePath.startsWith(componentsPath)) {
//       const subPath = modulePath.slice(componentsPath.length)
//       const name = subPath.split('/')[1]
//       const normalizeName = pascalCase(name)
//       if (!components[normalizeName]) {
//         const componentEntryPath = join(componentsPath, name, 'index.ts')
//         const realtivePath = relative(entryTsPath + '/../', componentEntryPath)
//         components[normalizeName] = {
//           path: './' + realtivePath
//         }
//       }
//     }
//     if (modulePath.startsWith(pagesPath)) {
//       const subPath = modulePath.slice(pagesPath.length)
//       const name = subPath.split('/')[1]
//       const normalizeName = pascalCase(name)
//       if (!components[normalizeName]) {
//         const pageEntryPath = join(pagesPath, name, 'index.ts')
//         const realtivePath = relative(entryTsPath + '/../', pageEntryPath)
//         pages[normalizeName] = {
//           path: './' + realtivePath
//         }
//       }
//     }
//   })

//   const entryTs = `
// ${Object.keys(components)
//   .map(componentName => {
//     const component = components[componentName]
//     return `import Component${componentName} from '${component.path}';`
//   })
//   .join('\n')}

// ${Object.keys(pages)
//   .map(pageName => {
//     const page = pages[pageName]
//     return `import Page${pageName} from '${page.path}';`
//   })
//   .join('\n')}

// const components = {
// ${Object.keys(components)
//   .map(componentName => {
//     return `  ${componentName}:Component${componentName}`
//   })
//   .join(',\n')}
// }

// const pages = {
// ${Object.keys(pages)
//   .map(pageName => {
//     return `  ${pageName}:Page${pageName}`
//   })
//   .join(',\n')}
// }

// export {
//   components,
//   pages
// }
//   `

//   console.log('entryTs', entryTs)
//   files[entryTsPath] = entryTs

//   let bundleRes = await esbuild.build({
//     entryPoints: [entryTsPath],
//     bundle: true,
//     target: ['es2015'],
//     format: 'esm',
//     write: false,
//     external: Object.keys(dependencies),
//     outdir: join(config.outdir, './schema'),
//     sourcemap: true,
//     plugins: [
//       Vue({ modules: files, compiler: vueCompiler }),
//       FsPlugin({ modules: files })
//     ]
//   })

//   const outputFiles: Record<string, string> = {}

//   {
//     ;(bundleRes.outputFiles || []).map(e => {
//       outputFiles[e.path] = e.text
//     })
//   }

//   // swc转译下
//   await Promise.all(
//     Object.keys(outputFiles)
//       .filter(e => {
//         if (e.endsWith('.js')) {
//           return true
//         }
//         return false
//       })
//       .map(async key => {
//         const bundle = await swc.lib.transform(outputFiles[key], {
//           module: {
//             type: 'amd'
//           },
//           sourceMaps: 'inline',
//           inputSourceMap: outputFiles[key + '.map'] || '{}'
//         })
//         outputFiles[key] = bundle.code || ''
//         //@ts-ignore
//         outputFiles[key + '.map'] = JSON.stringify(bundle.map || '')
//       })
//   )
//   // TODO：接入less
//   // TODO: 构建结果含有隐私私有路径的问题

//   await Promise.all([
//     ...Object.keys(outputFiles)
//       .filter(e => {
//         if (e.endsWith('.js')) {
//           return true
//         }
//         return false
//       })
//       .map(async key => {
//         const minifyRes = await esbuild.transform(outputFiles[key], {
//           loader: 'js',
//           // minify: true,
//           sourcemap: true,
//           banner: `(function () {
// var define = window['${defineMethodName}']`,
//           footer: '})();'
//         })
//         outputFiles[key] =
//           minifyRes.code + `//# sourceMappingURL=` + 'index.js.map'
//         outputFiles[key + '.map'] = minifyRes.map
//       }),
//     ...Object.keys(outputFiles)
//       .filter(e => {
//         if (e.endsWith('.css')) {
//           return true
//         }
//         return false
//       })
//       .map(async key => {
//         const minifyRes = await esbuild.lib.transform(outputFiles[key], {
//           loader: 'css',
//           minify: true,
//           sourcemap: true
//         })
//         outputFiles[key] = minifyRes.code
//         outputFiles[key + '.map'] = minifyRes.map
//       })
//   ])

//   return outputFiles
// }
