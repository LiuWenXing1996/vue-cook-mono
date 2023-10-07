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
    external?: string
  }[]
}

export type IDeepRequiredCookConfig = DeepRequired<ICookConfig>
export type IPkgJson = ProjectManifest & {
  cookConfigFile?: string
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
    deps: []
  }
  return defaultConfig
}
