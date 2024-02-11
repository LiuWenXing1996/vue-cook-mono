import { cjsWrapperLoadWrapperJs } from './cjs-wrapper'
import { loadStyle } from './loadStyle'
import { fetchDeps } from './fetchDeps'

export interface ILoadSchemaConfig {
  depsEntryList: {
    jsUrl: string
    cssUrl: string
  }
  schemaEntryList: {
    jsUrl: string
    cssUrl: string
  }
  externalLibs?: Record<string, any>
}

export const loadSchema = async <T = any>(config: ILoadSchemaConfig) => {
  const { depsEntryList, schemaEntryList, externalLibs = {} } = config
  await loadStyle({ src: depsEntryList.cssUrl })
  const depModules = await cjsWrapperLoadWrapperJs({
    url: depsEntryList.jsUrl,
    modules: externalLibs
  })
  // const depModules = await fetchDeps({
  //   entry: {
  //     js: depsEntryList.jsUrl,
  //     css: depsEntryList.cssUrl
  //   }
  // })
  debugger;
  await loadStyle({ src: schemaEntryList.cssUrl })
  const schemaModules = await cjsWrapperLoadWrapperJs({
    url: schemaEntryList.jsUrl,
    modules: depModules
  })

  return schemaModules as T | undefined
}

export interface IAutoLoadSchemaConfig {
  loadSchemaConfig: ILoadSchemaConfig
  onSucess: (schemaModules: any) => void
  onFail: (error: any) => void
}

export const autoLoadSchema = () => {
  const script = document.currentScript
  const configVarName = script?.dataset?.configVarName || ''
  // @ts-ignore
  const config = window[configVarName] as IAutoLoadSchemaConfig
  loadSchema(config.loadSchemaConfig)
    .then((schemaModules) => {
      config.onSucess(schemaModules)
    })
    .catch((error) => {
      config.onFail(error)
    })
}
