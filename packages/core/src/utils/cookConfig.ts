import type { ProjectManifest } from '@pnpm/types'
import type { DeepRequired } from 'utility-types'
import { createFsUtils, type IFsPromisesApi } from './fs'

export interface ICookConfig {
  root?: string
  ignorePaths?: string[]
  outdir?: string
  minify?: boolean
  tempDir?: string
  sourcemap?: boolean
  viewFileSuffix: {
    component: string
    page: string
    layout: string
  }
  embed?: {
    name: string
    externals?: {
      packageName: string
      injectName: string
    }[]
  }[]
  deps?: {
    name: string
    entry?: string
    injectName?: string // 是不是必须的？
  }[]
  overrideCookMetas: {
    name: string
    meta: ICookMeta
  }[]
}

export interface ICookMeta {
  isRemotePlugin?: boolean
  remotePluginVarName?: string
  remotePlugins?: {
    name: string
    varName: string
  }[]
  materialsVarName?: string
  viewsVarName?: string
  editorsVarName?: string
  materials?: { name: string; varName: string }[]
  runtimeEntry?: {
    import?: string
    assets?: string[]
  }
  designerEntry?: {
    import?: string
    assets?: string[]
  }
}

export interface ICookMaterialConfig {
  editorEntry: {
    js: string
    css: string
  }
  designViewEntry: {
    js: string
    css: string
  }
}

export type IDeepRequiredCookConfig = DeepRequired<ICookConfig>
export type IPkgJson = ProjectManifest & {
  cookConfigFile?: string // support json and yaml ? or only yaml
  cookMetaFile?: string // support json and yaml ? or only yaml
}

export const getCookConfigRelativePath = (pkgJson: IPkgJson) => {
  return pkgJson.cookConfigFile || 'cook.config.json'
}

export const getCookConfigFromFs = async (fs: IFsPromisesApi) => {
  const fsUtils = createFsUtils(fs)
  const packageJsonPath = './package.json'
  const pkgJson = await fsUtils.readJson<IPkgJson>(packageJsonPath)
  const cookConfigRelativePath = pkgJson.cookConfigFile || 'cook.config.json'
  const cookConfig = await fsUtils.readJson<ICookConfig>(packageJsonPath)
  return {
    path: cookConfigRelativePath,
    content: fillConfig(cookConfig)
  }
}

export const fillConfig = (config: ICookConfig): IDeepRequiredCookConfig => {
  const defaultConfig = getCookConfigDefault()

  let _config = {
    ...defaultConfig,
    ...config
  } as IDeepRequiredCookConfig

  return _config
}

export const getCookConfigDefault = () => {
  const defaultConfig: IDeepRequiredCookConfig = {
    root: './src',
    ignorePaths: [],
    outdir: './dist',
    minify: true,
    tempDir: './node_modules/.vue-cook',
    sourcemap: true,
    deps: [],
    overrideCookMetas: [],
    viewFileSuffix: {
      component: '.cook-component.json',
      page: '.cook-page.json',
      layout: '.cook-layout.json'
    },
    embed: []
  }
  return defaultConfig
}
