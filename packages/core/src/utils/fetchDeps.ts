import { createCoreLibOnceGetterId } from '.'
import type { ICookMeta, IPkgJson } from '..'
import { loadScript } from './loadScript'
import { loadStyle } from './loadStyle'
import { v4 as uuidv4 } from 'uuid'

const genAbsoulteUrl = (url: string, targetWindow: Window) => {
  const { document, location } = targetWindow
  const script = document.currentScript as HTMLScriptElement
  const scriptUrl = new URL(script?.src, location.href)
  const newUrl = new URL(url, scriptUrl)
  return newUrl.toString()
}
export const ElementDataFetchDepsContextIdKey = 'fetchDepsContextId'
export const ElementDataCoreLibOnceGetterIdIdKey = 'coreLibOnceGetterId'
export interface IDep {
  meta: IDepMeta
  value: unknown
}
export interface IDepMeta {
  cookMeta?: ICookMeta
  name: string
  version: string | undefined
  packageJson: IPkgJson
}
export type IDeps = Map<string, IDep>
export interface IDepsEntry {
  js: string
  css: string
}
const depsMap = new Map<string, IDeps>()

export const exportDeps = (config: { deps: IDeps; targetWindow: Window }) => {
  const { deps, targetWindow } = config
  const { document } = targetWindow
  const script = document.currentScript
  const uid = script?.dataset?.[ElementDataFetchDepsContextIdKey] || ''
  if (uid) {
    depsMap.set(uid, deps)
  }
}

export const resolveDepVar = <T>(params: { dep?: IDep; varName: string }) => {
  const { dep, varName } = params
  if (!dep) {
    return
  }
  const depValue: Record<string, any> = dep?.value || {}
  return depValue[varName] as T
}

export const fetchDeps = async <T extends IDeps = IDeps>(config: {
  entry: IDepsEntry
  targetWindow: Window
}) => {
  const { targetWindow } = config
  const id = uuidv4()
  const entryJsAbsoultePath = genAbsoulteUrl(config.entry.js, targetWindow)
  const entryCssAbsoultePath = genAbsoulteUrl(config.entry.css, targetWindow)

  await Promise.all([
    (async () => {
      try {
        await loadStyle({
          src: entryCssAbsoultePath,
          dataset: {
            [ElementDataFetchDepsContextIdKey]: id
          },
          targetWindow
        })
      } catch (error) {}
    })(),
    (async () => {
      const coreLibOnceGetterId = createCoreLibOnceGetterId(targetWindow)
      await loadScript({
        src: entryJsAbsoultePath,
        dataset: {
          [ElementDataFetchDepsContextIdKey]: id,
          [ElementDataCoreLibOnceGetterIdIdKey]: coreLibOnceGetterId
        },
        targetWindow
      })
    })()
  ])
  const deps = depsMap.get(id)

  return deps as T | undefined
}
