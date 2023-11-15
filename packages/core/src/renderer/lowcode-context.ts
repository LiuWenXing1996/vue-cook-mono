import { v4 as uuidv4 } from 'uuid'
import { fetchDeps, type IDepsEntry } from '@/utils/fetchDeps'
import { loadStyleByContent } from '@/utils/loadStyle'
import sandbox, { globalModulesMapName } from '@/utils/sandbox'
import type { IViewSchema } from '..'
import { createReactiveStore } from '@/utils/reactive'

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
    return contextMap.get(contextUid)
  }
}

const contextMap = new Map<string, ILowcodeContext>()
export type ILowcodeContext = Awaited<ReturnType<typeof createLowcodeContext>>
export const createLowcodeContext = async (config: {
  depsEntry: IDepsEntry
  targetWindow: Window
  externalLibs?: Record<string, any>
}) => {
  const { depsEntry, targetWindow, externalLibs } = config
  const id = `LowcodeContext-${uuidv4()}`
  const store = createReactiveStore<{
    bundleData?: ILowcodeBundleData
    runResult?: ILowcodeRunResult
  }>({})
  const deps = await fetchDeps({
    entry: depsEntry,
    targetWindow,
    dataset: {
      [ElementDataLowcodeContextIdKey]: id
    }
  })
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
          },
          targetWindow
        })
      })(),
      (async () => {
        const runResult = await sandbox({
          code: js,
          ctx: {
            [globalModulesMapName]: { ...deps }
          },
          targetWindow
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
      return { ...deps }
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
  return conext
}
