import { createCoreLibOnceGetterId } from '.'
import type { ICookMeta, IPkgJson } from '..'
import { loadScript } from './loadScript'
import { loadStyle } from './loadStyle'
import { v4 as uuidv4 } from 'uuid'

const genAbsoulteUrl = (url: string) => {
  const script = document.currentScript as HTMLScriptElement
  const scriptUrl = new URL(script?.src, location.href)
  const newUrl = new URL(url, scriptUrl)
  return newUrl.toString()
}
export const ElementDataFetchDepsContextIdKey = 'fetchDepsContextId'
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
export type IDeps = Map<string, IDep>
export interface IDepsEntry {
  js: string
  css: string
}
const depsMap = new Map<string, IDeps>()

export const exportDeps = (deps: IDeps) => {
  const script = document.currentScript
  const uid = script?.dataset?.[ElementDataFetchDepsContextIdKey] || ''
  if (uid) {
    depsMap.set(uid, deps)
  }
}

export const fetchDeps = async <T extends IDeps = IDeps>(config: { entry: IDepsEntry }) => {
  const id = uuidv4()
  const entryJsAbsoultePath = genAbsoulteUrl(config.entry.js)
  const entryJCssAbsoultePath = genAbsoulteUrl(config.entry.css)

  await Promise.all([
    (async () => {
      try {
        await loadStyle(entryJCssAbsoultePath, {
          [ElementDataFetchDepsContextIdKey]: id
        })
      } catch (error) {}
    })(),
    (async () => {
      const coreLibOnceGetterId = createCoreLibOnceGetterId()
      await loadScript(entryJsAbsoultePath, {
        [ElementDataFetchDepsContextIdKey]: id,
        [ElementDataCoreLibOnceGetterIdIdKey]: coreLibOnceGetterId
      })
    })()
  ])
  const deps = depsMap.get(id)

  return deps as T | undefined
}
