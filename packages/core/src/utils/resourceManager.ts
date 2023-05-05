import { uniqueId } from 'lodash-es'

export interface BaseResource {
  resourceName: string
  uid: string
}

export class ResourceManager<T extends Omit<BaseResource, 'uid'>> {
  private map = new Map<string, T | undefined>()
  private makeUid (resourceName: string) {
    const uid = uniqueId(`${resourceName}`)
    return uid
  }
  add (item: T) {
    const { resourceName } = item
    const uid = this.makeUid(resourceName)
    this.map.set(uid, item)
    return uid
  }
  has (uid: string) {
    return this.map.has(uid)
  }
  get (uid: string) {
    if (!this.has(uid)) {
      return
    }
    return this.map.get(uid)
  }
}
