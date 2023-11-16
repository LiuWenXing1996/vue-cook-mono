import * as self from '@/index'
import { v4 as uuidv4 } from 'uuid'

export type ICore = typeof self

export const createCoreLibOnceGetterId = () => {
  const prefix = '__vue__cook__core__lib__getter__'
  const uid = `${prefix}_${uuidv4()}`
  let isGet = false
  // @ts-ignore
  const oldValue = window[uid]
  const getter = () => {
    // @ts-ignore
    window[uid] = oldValue
    if (isGet) {
      return
    }
    isGet = true
    return self
  }
  // @ts-ignore
  window[uid] = getter

  return uid
}

export type DeepRequired<T> = {
  [P in keyof T]-?: DeepRequired<T[P]>
}

export type MaybePromise<T> = T | Promise<T>
