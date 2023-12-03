import type { IViewFileSchema } from "@/schema/view"
import type { IDeepRequiredCookConfig } from "@/utils/cookConfig"
import { fetchDeps, type IDeps, type IDepsEntry } from "@/utils/fetchDeps"
import { loadStyleByContent } from "@/utils/loadStyle"
import { createReactiveStore } from "@/utils/reactive"
import sandbox, { globalModulesMapName } from "@/utils/sandbox"
import { v4 as uuidv4 } from 'uuid'

export class LowcodeContext {
  #id = `LowcodeContext-${uuidv4()}`
  #currentStyleEl?: HTMLStyleElement | undefined
  #store = createReactiveStore<{
    bundleData?: ILowcodeBundleData
    runResult?: ILowcodeRunResult,
    externalLibs?: IExternalLibs,
    deps?: IDeps
  }>({})
  constructor() {
    const id = this.getId()
    contextMap.set(id, this)
  }
  async #setDepsByEntry(params: {
    entry: IDepsEntry,
  }) {
    const { entry } = params
    const deps = await fetchDeps({
      entry,
      dataset: {
        [ElementDataLowcodeContextIdKey]: this.getId()
      }
    })
    this.setDeps(deps)
  }
  async #setRunResultByBundleData(params: {
    bundleData: ILowcodeBundleData
  }) {
    const { bundleData } = params
    const { js = '', css = '' } = bundleData || {}
    const [styleEl, runResult] = await Promise.all([
      (async () => {
        return await loadStyleByContent({
          content: css,
          dataset: {
            [ElementDataLowcodeContextIdKey]: this.getId()
          }
        })
      })(),
      (async () => {
        const modules: {
          [key: string]: any
        } = {}
        const deps = this.getDeps() || {}
        Object.keys(deps).map((key) => {
          modules[key] = deps[key]?.value
        })
        const runResult = await sandbox({
          code: js,
          ctx: {
            [globalModulesMapName]: { ...modules }
          }
        })
        return runResult as ILowcodeRunResult | undefined
      })()
    ])
    this.#currentStyleEl?.remove()
    this.#currentStyleEl = styleEl
    this.setRunResult(runResult)
  }
  get getId() {
    return () => this.#id
  }
  get getDeps() {
    return this.#store.getHandler("deps", (value) => {
      return value ? { ...value } : undefined
    }).get
  }
  get setDeps() {
    return this.#store.getHandler("deps").set
  }
  get setDepsByEntry() {
    return this.#setDepsByEntry
  }
  get onDepsChange() {
    return this.#store.getHandler("deps").on
  }
  get getRunResult() {
    return this.#store.getHandler("runResult").get
  }
  get setRunResult() {
    return this.#store.getHandler("runResult").set
  }
  get setRunResultByBundleData() {
    return this.#setRunResultByBundleData
  }
  get onRunResultChange() {
    return this.#store.getHandler("runResult").on
  }
  get getExternalLibs() {
    return this.#store.getHandler("externalLibs").get
  }
  get setExternalLibs() {
    return this.#store.getHandler("externalLibs").set
  }
}


export type ILowcodeContext = LowcodeContext
export interface ILowcodeBundleData {
  js: string
  css: string
}
export interface ILowcodeBundleDataEntry {
  jsUrl: string
  cssUrl: string
}
export interface IExternalLibs {
  [libName: string]: any
}
export const fetchBundleData = async (entry: ILowcodeBundleDataEntry) => {
  const data: ILowcodeBundleData = {
    js: '',
    css: ''
  }

  try {
    const { jsUrl, cssUrl } = entry
    const js = await (await fetch(jsUrl)).text()
    data.js = js || ''
    const css = await (await fetch(cssUrl)).text()
    data.css = css || ''
  } catch (error) { }

  return data
}
export interface ILowcodeRunResult {
  schemaList: IViewFileSchema[]
  jsFunctions: {
    name: string
    schemaPath: string
    content: Function
  }[]
  cookConfig: IDeepRequiredCookConfig
}
const ElementDataLowcodeContextIdKey = 'cookLowcodeContextId'
const contextMap = new Map<string, ILowcodeContext>()
export const getLowcodeContextFromScript = (script: HTMLScriptElement) => {
  const contextUid = script.dataset[ElementDataLowcodeContextIdKey]
  if (contextUid) {
    return contextMap.get(contextUid)
  }
}