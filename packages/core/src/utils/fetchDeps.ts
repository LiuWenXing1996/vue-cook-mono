import { createCoreLibOnceGetterId } from '.'
import type { ICookMeta, IPkgJson } from '..'
import { loadScript } from './loadScript'
import { loadStyle } from './loadStyle'
import { v4 as uuidv4 } from 'uuid'

export const genAbsoulteUrl = (url: string) => {
  let newUrlString = url
  let scriptUrlString = ''
  try {
    const script = document.currentScript as HTMLScriptElement
    const scriptUrl = new URL(script?.src, location.href)
    scriptUrlString = scriptUrl.toString()
  } catch (error) {}
  try {
    const newUrl = new URL(url, scriptUrlString)
    newUrlString = newUrl.toString()
  } catch (error) {}
  return newUrlString
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
export type IDeps = {
  [packageName: string]: IDep | undefined
}
export interface IDepsEntry {
  js: string
  css: string
}
const depsMap = new Map<string, IDeps>()

export const exportDeps = (config: { deps: IDeps }) => {
  const { deps } = config
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
  dataset?: Record<string, string>
}) => {
  const { dataset } = config
  const id = uuidv4()
  const entryJsAbsoultePath = genAbsoulteUrl(config.entry.js)
  const entryCssAbsoultePath = genAbsoulteUrl(config.entry.css)

  await Promise.all([
    (async () => {
      try {
        await loadStyle({
          src: entryCssAbsoultePath,
          dataset: {
            ...dataset,
            [ElementDataFetchDepsContextIdKey]: id
          }
        })
      } catch (error) {}
    })(),
    (async () => {
      const coreLibOnceGetterId = createCoreLibOnceGetterId()
      await loadScript({
        src: entryJsAbsoultePath,
        dataset: {
          ...dataset,
          [ElementDataFetchDepsContextIdKey]: id,
          [ElementDataCoreLibOnceGetterIdIdKey]: coreLibOnceGetterId
        }
      })
    })()
  ])
  const deps = depsMap.get(id) || {}

  return deps
}
