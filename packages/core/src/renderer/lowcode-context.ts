import { v4 as uuidv4 } from 'uuid'
import { fetchDeps, genAbsoulteUrl, type IDepsEntry } from '@/utils/fetchDeps'
import { loadStyleByContent } from '@/utils/loadStyle'
import sandbox, { globalModulesMapName } from '@/utils/sandbox'
import type { IDeepRequiredCookConfig, IDeps, IViewSchema } from '..'
import { createReactiveStore } from '@/utils/reactive'
import type { IViewFileSchema } from '@/schema/view'

export interface ILowcodeBundleData {
  js: string
  css: string
}

export interface ILowcodeBundleDataEntry {
  jsUrl: string
  cssUrl: string
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
  } catch (error) {}

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
export const getLowcodeContextFromScript = (script: HTMLScriptElement) => {
  const contextUid = script.dataset[ElementDataLowcodeContextIdKey]
  if (contextUid) {
    return contextMap.get(contextUid)
  }
}

const contextMap = new Map<string, ILowcodeContext>()
export type ILowcodeContext = Awaited<ReturnType<typeof createLowcodeContext>>
export const createLowcodeContext = async (config: {
  depsEntry: IDepsEntry
  externalLibs?: Record<string, any>
}) => {
  const { depsEntry, externalLibs } = config
  const id = `LowcodeContext-${uuidv4()}`
  const store = createReactiveStore<{
    bundleData?: ILowcodeBundleData
    runResult?: ILowcodeRunResult
  }>({})

  let currentStyleEl: HTMLStyleElement | undefined = undefined
  const run = async () => {
    const bundleData = store.get('bundleData')
    const { js = '', css = '' } = bundleData || {}
    await Promise.all([
      (async () => {
        currentStyleEl?.remove()
        currentStyleEl = await loadStyleByContent({
          content: css,
          dataset: {
            [ElementDataLowcodeContextIdKey]: id
          }
        })
      })(),
      (async () => {
        const modules: {
          [key: string]: any
        } = {}
        Object.keys(deps).map((key) => {
          modules[key] = deps[key]?.value
        })
        const runResult = await sandbox({
          code: js,
          ctx: {
            [globalModulesMapName]: { ...modules }
          }
        })
        store.set('runResult', runResult)
      })()
    ])
  }
  store.on('bundleData', () => {
    run()
  })
  const conext = {
    getId: () => id,
    getDeps: () => {
      return { ...deps } as IDeps
    },
    getRunResult: () => {
      const runResult = store.get('runResult')
      if (runResult) {
        return { ...runResult }
      }
    },
    getExternalLibs: () => {
      return { ...externalLibs }
    },
    setBundleData: (data: ILowcodeBundleData | undefined) => {
      store.set('bundleData', data)
    },
    onRunResultChange: (listener: (data: ILowcodeRunResult | undefined) => void) => {
      return store.on('runResult', (data) => {
        listener(data ? { ...data } : undefined)
      })
    }
  }
  contextMap.set(id, conext)
  const deps = await fetchDeps({
    entry: depsEntry,
    dataset: {
      [ElementDataLowcodeContextIdKey]: id
    }
  })
  return conext
}
