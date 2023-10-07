import type * as esbuild from 'esbuild'
import type * as swc from '@swc/core'
import { createVfs, type IVirtulFileSystem } from '../utils/fs'
import { genDefaultOptions } from './plugins/genDefaultOptions'
import { virtualFs } from './plugins/virtualFs'
import type { DeepLevel2Partial, MaybePromise, NotAFunction } from '@/utils'
import type { FSWatcher } from 'node:fs'

export type IEsbuild = typeof esbuild
export type ISwc = typeof swc

export interface IBuildConfig {
  env: 'node' | 'browser'
  vfs: IVirtulFileSystem
  esbuild: IEsbuild
  entry: string
  outdir: string
  swc: ISwc
  minify?: boolean
  sourcemap?: boolean
  plugins?: IPlugin[]
  disableWrite?: boolean
}

export interface ICurrentBuildOptions {
  bundle: esbuild.BuildOptions
  transform: swc.Options
  minify: {
    css: esbuild.TransformOptions
    js: esbuild.TransformOptions
  }
}

export interface IPluginHelper {
  getVirtualFileSystem: () => IVirtulFileSystem
  getBuildConfig: () => IBuildConfig
  getPlugins: () => IPlugin[]
}

export interface IPlugin extends NotAFunction {
  name: string
  enforce?: 'pre' | 'post'
  api?: Record<string, any>
  setup?: (helper: IPluginHelper) => MaybePromise<void>
  bundleStart?: (
    options: ICurrentBuildOptions['bundle'],
    helper: IPluginHelper
  ) => MaybePromise<Partial<ICurrentBuildOptions['bundle']> | void>
  transformStart?: (
    options: ICurrentBuildOptions['transform'],
    helper: IPluginHelper
  ) => MaybePromise<Partial<ICurrentBuildOptions['transform']> | void>
  minifyStart?: (
    options: ICurrentBuildOptions['minify'],
    helper: IPluginHelper
  ) => MaybePromise<DeepLevel2Partial<ICurrentBuildOptions['minify']> | void>
}

const runPluginHook = async (options: {
  hookName: 'setup' | 'bundleStart' | 'transformStart' | 'minifyStart'
  plugin: IPlugin
  helper: IPluginHelper
  currentOptions: ICurrentBuildOptions
}) => {
  const { plugin, hookName, helper, currentOptions } = options
  const { name } = plugin
  try {
    if (hookName === 'setup') {
      await plugin?.[hookName]?.(helper)
    }
    if (hookName === 'bundleStart') {
      const inputOptions = currentOptions['bundle']
      const res = await plugin?.[hookName]?.(inputOptions, helper)
      currentOptions.bundle = {
        ...currentOptions.bundle,
        ...res
      }
    }
    if (hookName === 'transformStart') {
      const inputOptions = currentOptions['transform']
      const res = await plugin?.[hookName]?.(inputOptions, helper)
      currentOptions.transform = {
        ...currentOptions.transform,
        ...res
      }
    }
    if (hookName === 'minifyStart') {
      const inputOptions = currentOptions['minify']
      const res = await plugin?.[hookName]?.(inputOptions, helper)
      currentOptions.minify.js = {
        ...currentOptions.minify.js,
        ...res?.js
      }
      currentOptions.minify.css = {
        ...currentOptions.minify.css,
        ...res?.css
      }
    }
  } catch (error) {
    console.error(`[${name}:${hookName}]`, error)
    throw error
  }
}

export interface IOutJsFile {
  type: 'js'
  content: string
}

export interface IOutMapFile {
  type: 'map'
  content: string
}

export interface IOutCssFile {
  type: 'css'
  content: string
}

export interface IOutOtherFile {
  type: 'other'
  content: Uint8Array
}

export type IOutFile = IOutJsFile | IOutCssFile | IOutOtherFile | IOutMapFile

export const getOutFilesByType = <T extends IOutFile = IOutFile>(
  outputFiles: Record<string, IOutFile>,
  type: T['type']
) => {
  let files: Record<string, T> = {}
  Object.keys(outputFiles).map((filePath) => {
    const outFile = outputFiles[filePath]
    if (outFile.type === type) {
      files[filePath] = outFile as T
    }
  })
  return files
}

export const build = async (config: IBuildConfig) => {
  const { esbuild, vfs, swc, disableWrite } = config
  let { plugins } = config
  plugins = plugins || []
  const prePlugins: IPlugin[] = []
  const postPlugins: IPlugin[] = []
  const midPlugins: IPlugin[] = []
  for (const p of plugins) {
    if (p.enforce === 'pre') {
      prePlugins.push(p)
      return
    }
    if (p.enforce === 'post') {
      postPlugins.push(p)
      return
    }
    midPlugins.push(p)
  }

  plugins = [genDefaultOptions(), ...prePlugins, ...midPlugins, ...postPlugins, virtualFs()]

  const helper: IPluginHelper = {
    getVirtualFileSystem: () => {
      return vfs
    },
    getBuildConfig: () => {
      return {
        ...config
      }
    },
    getPlugins: () => {
      return [...(plugins || [])]
    }
  }

  const currentOptions: ICurrentBuildOptions = {
    bundle: {},
    transform: {},
    minify: {
      css: {},
      js: {}
    }
  }

  for (let i = 0; i < plugins.length; i++) {
    const plugin = plugins[i]
    await runPluginHook({
      hookName: 'setup',
      plugin,
      helper,
      currentOptions
    })
  }
  const outputFiles: Record<string, IOutFile> = {}

  {
    // bundle
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i]
      await runPluginHook({
        hookName: 'bundleStart',
        plugin,
        helper,
        currentOptions
      })
    }
    // TODO：接入less,不一定，esbuild已经支持css嵌套语法了，less的语法其实没有必要
    // TODO: 构建结果含有隐私私有路径的问题
    const bundleRes = await esbuild.build(currentOptions.bundle)
    {
      ;(bundleRes.outputFiles || []).map((e) => {
        if (e.path.endsWith('.js')) {
          outputFiles[e.path] = {
            type: 'js',
            content: e.text
          }
          return
        }
        if (e.path.endsWith('.css')) {
          outputFiles[e.path] = {
            type: 'css',
            content: e.text
          }
          return
        }
        if (e.path.endsWith('.map')) {
          outputFiles[e.path] = {
            type: 'map',
            content: e.text
          }
          return
        }
        outputFiles[e.path] = {
          type: 'other',
          content: e.contents
        }
      })
    }
  }

  {
    // transform
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i]
      await runPluginHook({
        hookName: 'transformStart',
        plugin,
        helper,
        currentOptions
      })
    }
    const outJsFiles = getOutFilesByType<IOutJsFile>(outputFiles, 'js')
    await Promise.all(
      Object.keys(outJsFiles).map(async (key) => {
        const bundle = await swc.transform(outJsFiles[key].content, currentOptions.transform)
        outputFiles[key] = {
          type: 'js',
          content: bundle.code || ''
        }
        outputFiles[key + '.map'] = {
          type: 'map',
          content: JSON.stringify(bundle.map || '')
        }
      })
    )
  }

  {
    // minify
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i]
      await runPluginHook({
        hookName: 'minifyStart',
        plugin,
        helper,
        currentOptions
      })
    }
    const outJsFiles = getOutFilesByType<IOutJsFile>(outputFiles, 'js')
    const outcssFiles = getOutFilesByType<IOutCssFile>(outputFiles, 'css')

    await Promise.all([
      ...Object.keys(outJsFiles).map(async (key) => {
        const minifyRes = await esbuild.transform(outJsFiles[key].content, currentOptions.minify.js)
        outputFiles[key] = {
          type: 'js',
          content: minifyRes.code + `//# sourceMappingURL=` + 'index.js.map'
        }
        outputFiles[key + '.map'] = {
          type: 'map',
          content: minifyRes.map
        }
      }),
      ...Object.keys(outcssFiles).map(async (key) => {
        const minifyRes = await esbuild.transform(
          outcssFiles[key].content,
          currentOptions.minify.css
        )
        outputFiles[key] = {
          type: 'css',
          content: minifyRes.code + `//# sourceMappingURL=` + 'index.css.map'
        }
        outputFiles[key + '.map'] = {
          type: 'map',
          content: minifyRes.map
        }
      })
    ])
  }

  if (!disableWrite) {
    await Promise.all([
      ...Object.keys(outputFiles).map(async (key) => {
        await vfs.outputFile(key, outputFiles[key].content)
      })
    ])
  }

  return outputFiles
}

export interface IBuildContextConfig extends IBuildConfig {
  watch?: boolean
  onBuildEnd?: (res: {
    timestamp: number
    outputFiles: Record<string, IOutFile> | undefined
  }) => void
}

export type IBuildContext = Awaited<ReturnType<typeof createBuildContext>>

export const createBuildContext = async (config: IBuildContextConfig) => {
  const { watch, vfs: outVfs, onBuildEnd } = config
  const inVfs = createVfs()
  await inVfs.copyFromFs('/', outVfs)
  let watcher: FSWatcher | undefined = undefined
  let isBuilding = false
  const dispose = () => {
    watcher?.close()
  }
  if (watch) {
    watcher = outVfs.getFs().watch(
      '/',
      {
        recursive: true
      },
      async () => {
        if (!isBuilding) {
          await rebuild()
        }
      }
    )
  }

  const rebuild = async () => {
    if (isBuilding) {
      return
    }
    isBuilding = true
    const res = await build(config)
    onBuildEnd?.({
      timestamp: Date.now(),
      outputFiles: res
    })
    isBuilding = false
    return res
  }

  return {
    rebuild,
    dispose,
    getIsBuilding: () => {
      return isBuilding
    }
  }
}
