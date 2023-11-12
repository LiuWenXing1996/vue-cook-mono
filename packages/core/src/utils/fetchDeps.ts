import { createCoreLibOnceGetterId } from '.'
import type { ICookMeta, IPkgJson } from '..'
import { loadScript } from './loadScript'
import { loadStyle } from './loadStyle'
import { v4 as uuidv4 } from 'uuid'

const genAbsoulteUrl = (url: string, targetWindow: Window) => {
  const { location } = targetWindow
  const newUrl = new URL(url, location.href)
  return newUrl.toString()
}
const ElementDataFetchDepsContextIdKey = 'fetchDepsContextId'
export const ElementDataCoreLibOnceGetterIdIdKey = 'coreLibOnceGetterId'
export interface IDep {
  meta: IDepMeta
  value: any
}
export interface IDepMeta {
  cookMeta?: ICookMeta
  name: string
  version: string | undefined
  packageJson: IPkgJson
}
export type IDeps = Record<string, IDep | undefined>
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

export const fetchDeps = async (config: {
  entry: IDepsEntry
  targetWindow: Window
  dataset?: Record<string, string>
}) => {
  const { targetWindow, dataset } = config
  console.log(targetWindow)
  const id = uuidv4()
  const entryJsAbsoultePath = genAbsoulteUrl(config.entry.js, targetWindow)
  const entryCssAbsoultePath = genAbsoulteUrl(config.entry.css, targetWindow)

  await Promise.all([
    (async () => {
      try {
        await loadStyle({
          src: entryCssAbsoultePath,
          dataset: {
            ...dataset,
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
          ...dataset,
          [ElementDataFetchDepsContextIdKey]: id,
          [ElementDataCoreLibOnceGetterIdIdKey]: coreLibOnceGetterId
        },
        targetWindow
      })
    })()
  ])
  const deps = depsMap.get(id) || {}

  return deps
}
