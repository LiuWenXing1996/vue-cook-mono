import { uniqueId } from 'lodash-es'
import { warn } from './customConsole'

export type IResourceType = 'defineHelper' | 'context' | 'state' | 'action'

export interface IResourceConfig<T extends IResourceType = IResourceType> {
  type: T
  uid: string
}

export type IResourceManager<T> = ReturnType<typeof createUidResourceManager<T>>

export const makeResourceRichName = (config: IResourceConfig) =>
  `[${config.uid}](${config.type})`

export const createUidResourceManager = <T>(
  type: IResourceType,
  parent?: IResourceConfig
) => {
  const map = new Map<string, T | undefined>()
  const makeUid = (name: string) => {
    const uid = uniqueId(`${name}`)
    return uid
  }
  const has = (uid?: string, isConsole: boolean = false) => {
    if (!uid) {
      return false
    }
    const res = map.has(uid)
    if (!res && isConsole) {
      const selfRichName = makeResourceRichName({ type, uid })
      if (parent) {
        warn(`未在${makeResourceRichName(parent)}中找到${selfRichName}`)
      } else {
        warn(`未找到${selfRichName}`)
      }
    }
    return res
  }

  const get = (uid?: string, isConsole: boolean = false) => {
    if (!uid) {
      return
    }
    if (!has(uid, isConsole)) {
      return
    }
    return map.get(uid)
  }

  const set = (
    uid: string,
    resource: T | undefined,
    isConsole: boolean = false
  ) => {
    if (has(uid)) {
      if (isConsole) {
        const selfRichName = makeResourceRichName({ type, uid })
        if (parent) {
          warn(`在${makeResourceRichName(parent)}中已存在${selfRichName}`)
        } else {
          warn(`已存在${selfRichName}`)
        }
      }
      return
    }
    map.set(uid, resource)
  }

  return {
    makeUid,
    has,
    get,
    set
  }
}
