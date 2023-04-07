import type { IInnerContext } from './createContext'

const innerContextMap: Map<string, IInnerContext> = new Map()

export const getInnerContext = (uid: string) => {
  return innerContextMap.get(uid)
}

export const setInnerContext = (uid: string, innerContext: IInnerContext) => {
  return innerContextMap.set(uid, innerContext)
}
