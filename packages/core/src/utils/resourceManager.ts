import { uniqueId } from 'lodash-es'

export interface Resource<T> {
  readonly name: string
  uid: string
  value: T
}

export const createResourceUid = (name: string) => {
  return uniqueId(`${name}`)
}

export class ResourceManager<T> {
  public map = new Map<string, Resource<T>>()
  add (name: string, value: T) {
    const uid = createResourceUid(name)
    this.map.set(uid, { uid, name, value })
    return uid
  }
  addByUid (uid: string, name: string, value: T) {
    if (!this.has(uid)) {
      this.map.set(uid, { uid, name, value })
    }
    return uid
  }
  has (uid: string) {
    return this.map.has(uid)
  }
  get (uid: string) {
    if (!this.has(uid)) {
      return
    }
    return this.map.get(uid)?.value
  }
}
