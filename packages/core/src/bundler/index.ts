import type * as esbuild from 'esbuild'
import type * as swc from '@swc/core'
import { join, relative, isAbsolute } from 'path-browserify'
import type * as vueCompiler from '@vue/compiler-sfc'
import type { IVirtulFileSystem } from './utils/fs'
import * as pathUtils from './utils/path'
import { genDefaultOptions } from './plugins/genDefaultOptions'
import { cloneDeep } from 'lodash'
import { virtualFs } from './plugins/virtualFs'
import { vue } from './plugins/vue'
// import { genEntryTs } from './plugins/genEntryTs'
import { exportSchema } from './plugins/exportSchema'
import { vueComponentSchema } from './plugins/vueComponentSchema'
import { vuePageSchema } from './plugins/vuePageSchema'
import { schemaToCode } from './plugins/schemaToCode'

const isSubPath = (parent: string, dir: string) => {
  const relativePath = relative(parent, dir)
  return relativePath && !relativePath.startsWith('..') && !isAbsolute(relativePath)
}

export interface IPkgJson {
  dependencies: Record<string, string>
  cookConfigJson?: string
}

export interface IPluginHelper {
  getPackageJson: () => IPkgJson
  getCookConfig: () => ICookConfig
  getVirtualFileSystem: () => IVirtulFileSystem
  getPathUtils: () => typeof pathUtils
  getBuildOptions: () => IBuildOptions
  getPlugins: () => IPlugin[]
}

export interface IMinifyOptions {
  css: esbuild.TransformOptions
  js: esbuild.TransformOptions
}

type DeepLevel2Partial<T> = T extends object
  ? {
      [P in keyof T]?: Partial<T[P]>
    }
  : T

export interface IMinifyOptions {
  css: esbuild.TransformOptions
  js: esbuild.TransformOptions
}

export interface IPlugin {
  name: string
  enforce?: 'pre' | 'post'
  api?: Record<string, any>
  bundleStart?: (
    options: esbuild.BuildOptions,
    helper: IPluginHelper
  ) => Partial<esbuild.BuildOptions | void> | Promise<Partial<esbuild.BuildOptions | void>>
  transformStart?: (
    options: esbuild.BuildOptions,
    helper: IPluginHelper
  ) => Partial<swc.Options | void> | Promise<Partial<swc.Options | void>>
  minifyStart?: (
    options: IMinifyOptions,
    helper: IPluginHelper
  ) => DeepLevel2Partial<IMinifyOptions> | void | Promise<DeepLevel2Partial<IMinifyOptions> | void>
}

export interface ICookConfig {
  root: string
  export?: {
    configName?: string
    entryName?: string
  }
  component?: {
    configName?: string
    entryName?: string
  }
  page?: {
    configName?: string
    entryName?: string
  }
  ignorePaths: string[]
  outdir: string
  minify?: boolean
  tempDir?: string
  deps?: Record<
    string,
    {
      entry: string
    }
  >
}
export type IEsbuild = typeof esbuild
export type ISwc = typeof swc

export interface IBuildOptions {
  env: 'node' | 'browser'
  vfs: IVirtulFileSystem
  plugins?: IPlugin[]
  esbuild: IEsbuild
  swc: ISwc
  vueCompiler: typeof vueCompiler
}

export const defineMethodName = '__vueCookAmdDefine__'

// TODO：hook run 逻辑合并
const runPluginBundleStart = async (
  plugin: IPlugin,
  helper: IPluginHelper,
  currentOptions: ICurrentOptions
) => {
  const { name } = plugin
  try {
    const _options = await plugin.bundleStart?.({ ...currentOptions.bundle }, helper)
    currentOptions.bundle = {
      ...currentOptions.bundle,
      ..._options
    }
  } catch (error) {
    // TODO：插件失败应该直接报错
    console.log(name, error)
  }
}

const runPluginTransformStart = async (
  plugin: IPlugin,
  helper: IPluginHelper,
  currentOptions: ICurrentOptions
) => {
  const { name } = plugin
  try {
    const _options = await plugin.transformStart?.({ ...currentOptions.transform }, helper)
    currentOptions.transform = {
      ...currentOptions.transform,
      ..._options
    }
  } catch (error) {
    // TODO：插件失败应该直接报错
    console.log(name, error)
  }
}

const runPluginMinifyStart = async (
  plugin: IPlugin,
  helper: IPluginHelper,
  currentOptions: ICurrentOptions
) => {
  const { name } = plugin
  try {
    const _options = await plugin.minifyStart?.({ ...currentOptions.minify }, helper)
    currentOptions.minify = {
      ...currentOptions.minify,
      ..._options
    }
  } catch (error) {
    // TODO：插件失败应该直接报错
    console.log(name, error)
  }
}

export interface ICurrentOptions {
  bundle: esbuild.BuildOptions
  transform: esbuild.BuildOptions
  minify: IMinifyOptions
}

export const build = async (options: IBuildOptions) => {
  console.log('build start')
  let { esbuild, vfs, swc, plugins } = options
  plugins = plugins || []
  const pkgJson = await vfs.readJson<IPkgJson>('package.json')
  if (!pkgJson) {
    return
  }
  const configJsonPath = pkgJson.cookConfigJson || 'cook.config.json'
  const config = await vfs.readJson<ICookConfig>(configJsonPath)
  if (!config) {
    return
  }
  const prePlugins: IPlugin[] = []
  const postPlugins: IPlugin[] = []
  const midPlugins: IPlugin[] = []
  plugins.forEach((p) => {
    if (p.enforce === 'pre') {
      prePlugins.push(p)
      return
    }
    if (p.enforce === 'post') {
      postPlugins.push(p)
      return
    }
    midPlugins.push(p)
  })

  plugins = [
    genDefaultOptions(),
    ...prePlugins,
    exportSchema(),
    vueComponentSchema(),
    vuePageSchema(),
    schemaToCode(),
    ...midPlugins,
    vue(),
    ...postPlugins,
    virtualFs()
  ]

  const helper: IPluginHelper = {
    getPackageJson: () => {
      return cloneDeep(pkgJson)
    },
    getCookConfig: () => {
      return cloneDeep(config)
    },
    getVirtualFileSystem: () => {
      return vfs
    },
    getPathUtils: () => {
      return { ...pathUtils }
    },
    getBuildOptions: () => {
      return {
        ...options
      }
    },
    getPlugins: () => {
      return [...(plugins || [])]
    }
  }

  const currentOptions: ICurrentOptions = {
    bundle: {},
    transform: {},
    minify: {
      css: {},
      js: {}
    }
  }
  for (let i = 0; i < plugins.length; i++) {
    const plugin = plugins[i]
    await runPluginBundleStart(plugin, helper, currentOptions)
  }
  const bundleRes = await esbuild.build(currentOptions.bundle)
  const outputFiles: Record<string, string> = {}
  {
    ;(bundleRes.outputFiles || []).map((e) => {
      // TODO:这个地方需要考虑到非js文件的情况
      outputFiles[e.path] = e.text
    })
  }
  let hasStyle = false
  {
    ;(bundleRes.outputFiles || []).map((e) => {
      if (e.path.endsWith('.css')) {
        hasStyle = true
      }
      outputFiles[e.path] = e.text
    })
  }
  const entryJs = `
${hasStyle ? 'import "./index.css"' : ''}
export * from "./index";
export {default} from "./index";
        `
  const outDir = currentOptions.bundle.outdir
  if (!outDir) {
    throw new Error('必须指定bundle.outdir')
  }
  outputFiles[pathUtils.resolve(outDir, './entry.js')] = entryJs

  for (let i = 0; i < plugins.length; i++) {
    const plugin = plugins[i]
    await runPluginTransformStart(plugin, helper, currentOptions)
  }
  await Promise.all(
    Object.keys(outputFiles)
      .filter((e) => {
        if (e.endsWith('.js')) {
          return true
        }
        return false
      })
      .map(async (key) => {
        const bundle = await swc.transform(outputFiles[key], currentOptions.transform)
        outputFiles[key] = bundle.code || ''
        //@ts-ignore
        outputFiles[key + '.map'] = JSON.stringify(bundle.map || '')
      })
  )
  // TODO：接入less,不一定，esbuild已经支持css嵌套语法了，less的语法其实没有必要
  // TODO: 构建结果含有隐私私有路径的问题
  for (let i = 0; i < plugins.length; i++) {
    const plugin = plugins[i]
    await runPluginMinifyStart(plugin, helper, currentOptions)
  }

  await Promise.all([
    ...Object.keys(outputFiles)
      .filter((e) => {
        if (e.endsWith('.js')) {
          return true
        }
        return false
      })
      .map(async (key) => {
        const minifyRes = await esbuild.transform(outputFiles[key], currentOptions.minify.js)
        outputFiles[key] = minifyRes.code + `//# sourceMappingURL=` + 'index.js.map'
        outputFiles[key + '.map'] = minifyRes.map
      }),
    ...Object.keys(outputFiles)
      .filter((e) => {
        if (e.endsWith('.css')) {
          return true
        }
        return false
      })
      .map(async (key) => {
        const minifyRes = await esbuild.transform(outputFiles[key], currentOptions.minify.css)
        // TODO:css的sourcemap有问题
        outputFiles[key] = minifyRes.code
        outputFiles[key + '.map'] = minifyRes.map
      })
  ])

  await Promise.all([
    ...Object.keys(outputFiles).map(async (key) => {
      await vfs.outputFile(key, outputFiles[key])
    })
  ])

  return outputFiles
}

export type IBuildContext = Awaited<ReturnType<typeof createBuildContext>>

export const createBuildContext = async (options: IBuildOptions) => {
  const { esbuild, vfs, swc, plugins = [] } = options

  const dispose = () => {
    watcher.close()
  }
  // TODO：为啥没有build呢？
  const watcher = vfs.getFs().watch(
    '/',
    {
      recursive: true
    },
    async () => {
      // await build(options)
    }
  )

  // 那就没有自定触发这个逻辑？
  // 可以把逻辑拆开
  const _rebuild = async () => {
    await build(options)
  }

  return {
    rebuild: _rebuild,
    dispose
  }
}
