import { v4 as uuidv4 } from 'uuid'
import { fetchDeps, type IDeps, type IDepsEntry } from '@/utils/fetchDeps'
import { loadStyleByContent } from '@/utils/loadStyle'
import sandbox, { globalModulesMapName } from '@/utils/sandbox'
import { TinyEmitter } from 'tiny-emitter'
import type { IViewSchema } from '..'

export interface ILowcodeContextConfig {
  depsEntry: IDepsEntry
  targetWindow: Window
  externalLibs?: Record<string, any>
}

export interface ILowcodeBundleData {
  js: string
  css: string
}

export interface ILowcodeRunResult {
  schemaList: {
    path: string
    type: string
    content: IViewSchema
  }[]
  jsFunctions: {
    name: string
    schemaPath: string
    content: Function
  }[]
}

const ElementDataLowcodeContextIdKey = 'cookLowcodeContextId'

export const getLowcodeContextFromScript = (script: HTMLScriptElement) => {
  const contextUid = script.dataset[ElementDataLowcodeContextIdKey]
  if (contextUid) {
    return contextMap.get(contextUid)?.context
  }
}

const contextMap = new Map<
  string,
  {
    internalContext: InternalLowcodeContext
    context: LowcodeContext
  }
>()

class InternalLowcodeContext {
  #id: string
  #deps: IDeps
  #config: ILowcodeContextConfig
  #currentStyleEl: HTMLStyleElement | undefined = undefined
  #runResult?: ILowcodeRunResult
  #bundleData?: ILowcodeBundleData
  #emitter = new TinyEmitter()
  constructor(config: ILowcodeContextConfig, context: LowcodeContext) {
    this.#id = uuidv4()
    this.#deps = {}
    this.#config = config
    contextMap.set(this.#id, {
      internalContext: this,
      context
    })
  }

  get id() {
    return this.#id
  }
  async init() {
    const deps = await fetchDeps({
      entry: this.#config.depsEntry,
      targetWindow: this.#config.targetWindow,
      dataset: {
        [ElementDataLowcodeContextIdKey]: this.#id
      }
    })
    console.log(this.#deps)
    console.log(deps)
    this.#deps = { ...deps }
  }
  async reRun() {
    const { js = '', css = '' } = this.#bundleData || {}
    await Promise.all([
      (async () => {
        this.#currentStyleEl?.remove()
        this.#currentStyleEl = await loadStyleByContent({
          content: css,
          dataset: {
            [ElementDataLowcodeContextIdKey]: this.#id
          },
          targetWindow: this.#config.targetWindow
        })
      })(),
      (async () => {
        this.runResult = await sandbox({
          code: js,
          ctx: {
            [globalModulesMapName]: this.#deps
          },
          targetWindow: this.#config.targetWindow
        })
      })()
    ])
  }
  get deps() {
    console.log(this.#deps)
    return { ...this.#deps }
  }
  get runResult() {
    return this.#runResult
  }
  set runResult(value: ILowcodeRunResult | undefined) {
    this.#runResult = value
    this.#emitter.emit('onChangeRunResult', value)
  }
  onChangeRunResult(listener?: (data: ILowcodeRunResult | undefined) => void) {
    if (listener) {
      this.#emitter.on('onChangeRunResult', listener)
    }
    return () => {
      if (listener) {
        this.#emitter.off('onChangeRunResult', listener)
      }
    }
  }

  set bundleData(value: ILowcodeBundleData | undefined) {
    this.#bundleData = value
    this.reRun()
  }
  getExternalLibs() {
    return { ...this.#config.externalLibs }
  }
}

class LowcodeContext {
  #internalContext: InternalLowcodeContext
  constructor(config: ILowcodeContextConfig) {
    this.#internalContext = new InternalLowcodeContext(config, this)
  }

  get id() {
    return this.#internalContext.id
  }

  getJsFunctions() {
    return this.#internalContext.runResult?.jsFunctions || []
  }

  getSchemaList() {
    return this.#internalContext.runResult?.schemaList || []
  }

  getRunResult() {
    return this.#internalContext.runResult
  }

  getDeps() {
    return this.#internalContext.deps
  }

  getExternalLibs() {
    return { ...this.#internalContext.getExternalLibs() }
  }

  setBundleData(value?: ILowcodeBundleData) {
    this.#internalContext.bundleData = value
  }

  onChangeRunResult(listener?: (data: ILowcodeRunResult | undefined) => void) {
    return this.#internalContext.onChangeRunResult(listener)
  }
}

export type ILowcodeContext = LowcodeContext

export const createLowcodeContext = async (config: ILowcodeContextConfig) => {
  const conext = new LowcodeContext(config)
  const internalContext = contextMap.get(conext.id)?.internalContext as InternalLowcodeContext
  await internalContext.init()
  return conext
}
