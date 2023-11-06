import type { ProjectManifest } from '@pnpm/types'
import type { DeepRequired } from 'utility-types'

export interface ICookConfig {
  root?: string
  ignorePaths?: string[]
  outdir?: string
  minify?: boolean
  tempDir?: string
  sourcemap?: boolean
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
    overrideCookMetas: []
  }
  return defaultConfig
}
