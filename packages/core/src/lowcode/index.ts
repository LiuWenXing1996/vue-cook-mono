import sandbox, { globalModulesMapName } from './sandbox'
import { extname } from '../utils/path'
import { loadStyle, loadStyleByContent } from './loadStyle'
import { loadScript } from './loadScript'
import { v4 as uuidv4 } from 'uuid'
import { createCoreLibOnceGetterId } from '@/utils'
import { listenEditorWindowSchemaChange, type ISchemaChanegeData } from './schemaChange'
import { cjsWrapperLoadWrapperJs } from '..'

export interface ILowcodeContextConfig {
  depsEntryList: {
    jsUrl: string
    cssUrl: string
  }
  schemaEntryList: {
    jsUrl: string
    cssUrl: string
  }
  externalLibs?: Record<string, any>
  dev?: boolean
}
export const ElementDataLowcodeContextIdKey = 'cookContextId'
export const ElementDataCoreLibOnceGetterIdIdKey = 'coreLibOnceGetterId'


export type ILowcodeContext = Awaited<ReturnType<typeof createLowcodeContext>>

export const createLowcodeContext = async (config: ILowcodeContextConfig) => {
  // const { depsEntryList, schemaEntryList, externalLibs = {}, dev = false } = config
  // await loadStyle(depsEntryList.cssUrl)
  // const depModules = await cjsWrapperLoadWrapperJs({
  //   url: depsEntryList.jsUrl,
  //   modules: externalLibs
  // })
  // await loadStyle(schemaEntryList.cssUrl)
  // const schemaModules = await cjsWrapperLoadWrapperJs({
  //   url: depsEntryList.jsUrl,
  //   modules: depModules
  // })
  // const internalContext = await createInternalLowcodeContext(config)

  // const context = exportLowcodeContext(internalContext)
  // contextMap.set(context.id, context)
  // await internalContext.initDeps()
  // // if (config.dev) {
  // //   await internalContext.initSchemaData()
  // // }
  // await internalContext.initSchemaData()
  // return context
}
