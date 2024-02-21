import { cjsWrapperLoadWrapperJs } from './cjs-wrapper'
import { loadStyle } from './load-style'

export interface ILoadModuleConfig {
  entry: {
    jsUrl: string
    cssUrl: string
  }
  externalModules?: Record<string, any>
}

export const loadModule = async <T = any>(config: ILoadModuleConfig) => {
  const { entry, externalModules } = config
  await loadStyle({ src: entry.cssUrl })
  const module = await cjsWrapperLoadWrapperJs({
    url: entry.jsUrl,
    modules: externalModules || {}
  })
  return module as T | undefined
}

export interface IAutoLoadModuleConfig {
  loadModuleConfig: ILoadModuleConfig
  onSucess: (module: any) => void
  onFail: (error: any) => void
}

export const autoLoadModule = () => {
  const script = document.currentScript
  const configVarName = script?.dataset?.configVarName || ''
  const config = window[configVarName] as IAutoLoadModuleConfig
  loadModule(config.loadModuleConfig)
    .then((schemaModules) => {
      config.onSucess(schemaModules)
    })
    .catch((error) => {
      config.onFail(error)
    })
}
