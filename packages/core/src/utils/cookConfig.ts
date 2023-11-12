import type { ProjectManifest } from '@pnpm/types'
import type { DeepRequired } from 'utility-types'
import { createFsUtils, type IFsPromisesApi } from './fs'
import type { IViewSchema } from '@/schema/view'
import { resolve, dirname } from './path'

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
  renderer: {
    runtime: {
      packageName: string
      varName: string
    }
    design: {
      packageName: string
      varName: string
    }
    editor: {
      packageName: string
      varName: string
    }
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

export const getPkgJsonFromFs = async (fs: IFsPromisesApi) => {
  try {
    const fsUtils = createFsUtils(fs)
    const packageJsonPath = '/package.json'
    const pkgJson = await fsUtils.readJson<IPkgJson>(packageJsonPath)
    return {
      path: packageJsonPath,
      content: pkgJson
    }
  } catch (error) {}
}

export const getCookConfigFromFs = async (fs: IFsPromisesApi) => {
  try {
    const fsUtils = createFsUtils(fs)
    const { content: pkgJson, path: packageJsonPath } = (await getPkgJsonFromFs(fs)) || {}
    if (pkgJson && packageJsonPath) {
      let cookConfigPath = '/cook.config.json'
      if (pkgJson.cookConfigFile) {
        cookConfigPath = resolve(dirname(packageJsonPath), pkgJson.cookConfigFile)
      }
      const cookConfig = await fsUtils.readJson<ICookConfig>(cookConfigPath)
      return {
        path: cookConfigPath,
        content: fillConfig(cookConfig)
      }
    }
  } catch (error) {}
}

export const getViewFilesFromFs = async (fs: IFsPromisesApi) => {
  const viewFilesWithContent: {
    path: string
    type: IViewSchema['type']
    content: IViewSchema
  }[] = []

  const { content: cookConfig } = (await getCookConfigFromFs(fs)) || {}
  if (cookConfig) {
    const fsUtils = createFsUtils(fs)
    const allFiles = await fsUtils.listFiles()
    const viewFiles: {
      path: string
      type: IViewSchema['type']
    }[] = []
    allFiles.map((e) => {
      if (e.endsWith(cookConfig.viewFileSuffix.page)) {
        viewFiles.push({
          path: e,
          type: 'Page'
        })
      }
      if (e.endsWith(cookConfig.viewFileSuffix.component)) {
        viewFiles.push({
          path: e,
          type: 'Component'
        })
      }
      if (e.endsWith(cookConfig.viewFileSuffix.layout)) {
        viewFiles.push({
          path: e,
          type: 'Layout'
        })
      }
    })
    await Promise.all(
      viewFiles.map(async (file) => {
        try {
          const schema = await fsUtils.readJson<IViewSchema>(file.path)
          viewFilesWithContent.push({
            path: file.path,
            type: file.type,
            content: schema
          })
        } catch (error) {}
      })
    )
  }

  return viewFilesWithContent
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
    embed: [],
    renderer: {
      runtime: {
        packageName: '',
        varName: ''
      },
      design: {
        packageName: '',
        varName: ''
      },
      editor: {
        packageName: '',
        varName: ''
      }
    }
  }
  return defaultConfig
}
