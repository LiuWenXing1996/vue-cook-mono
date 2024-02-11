import type { WritableKeys } from 'utility-types'
import { Emitter } from './emitter'

export class Reactive<T extends object> {
  #emitter = new Emitter()
  #getPropertyChangeEventName<K extends WritableKeys<T>>(propertyName: K) {
    let a = propertyName
    return `on_${propertyName.toString()}_property_change`
  }
  #onPropertyChange<K extends WritableKeys<T>>(propertyName: K, listener: (data: T[K]) => void) {
    const eventName = this.#getPropertyChangeEventName(propertyName)
    return this.#emitter.listen(eventName, listener)
  }
  #emitPropertyChange<K extends WritableKeys<T>>(propertyName: K, data: T[K]) {
    const eventName = this.#getPropertyChangeEventName(propertyName)
    this.#emitter.emit(eventName, data)
  }
  get onPropertyChange() {
    return this.#onPropertyChange
  }
  get emitPropertyChange() {
    return this.#emitPropertyChange
  }
}

export interface IReactiveStoreData {
  [key: string]: any
}
export type IReactiveStoreValueProcesser<T extends IReactiveStoreData> = {
  [K in keyof T]?: (key: K, value: T[K], method: 'get' | 'set', store: ReactiveStore<T>) => T[K]
}

type IReactiveStoreWatchCallbackData<T extends IReactiveStoreData, KS extends (keyof T)[]> = {
  [key in KS[number]]: T[key]
}
// TODO：使用createReactiveStore替代？不然不好调试，这样影响还挺大的
export class ReactiveStore<T extends IReactiveStoreData = IReactiveStoreData> {
  #emitter = new Emitter()
  #data: T
  #valueProcesser: IReactiveStoreValueProcesser<T>
  constructor(params: { data: T; valueProcesser?: IReactiveStoreValueProcesser<T> }) {
    const { data, valueProcesser } = params
    this.#valueProcesser = valueProcesser ? { ...valueProcesser } : {}
    this.#data = { ...data }
  }
  #getAllChangeEventName = () => {
    return 'on_change_all'
  }
  #getEventName = <K extends keyof T>(key: K) => {
    return `on_${key.toString()}_change`
  }
  #emit = <K extends keyof T>(key: K, data: T[K]) => {
    const eventName = this.#getEventName(key)
    this.#emitter.emit(eventName, data)
  }
  #on = <K extends keyof T>(key: K, listener: (data: T[K]) => void) => {
    const eventName = this.#getEventName(key)
    return this.#emitter.listen(eventName, listener)
  }
  get on() {
    return this.#on
  }
  #get = <K extends keyof T>(key: K): T[K] => {
    const valueProcesser = this.#valueProcesser[key]
    let value = this.#data[key]
    if (valueProcesser) {
      value = valueProcesser(key, value, 'get', this)
    }
    return value
  }
  get get() {
    return this.#get
  }
  #getAll = () => {
    return {
      ...this.#data
    }
  }
  get getAll() {
    return this.#getAll
  }
  #set = <K extends keyof T>(key: K, value: T[K]) => {
    const valueProcesser = this.#valueProcesser[key]
    if (valueProcesser) {
      value = valueProcesser(key, value, 'set', this)
    }
    this.#data[key] = value
    this.#emit(key, value)
    this.#emitter.emit(this.#getAllChangeEventName(), this.#data)
  }
  get set() {
    return this.#set
  }
  #reset = (data: T) => {
    const { set, del } = this
    const newKeys = Object.keys(data) as (keyof T)[]
    const oldKeys = Object.keys(this.#data) as (keyof T)[]
    const allKeys = Array.from(new Set([...newKeys, ...oldKeys]))
    allKeys.map((key) => {
      if (newKeys.includes(key)) {
        set(key, data[key])
      } else {
        del(key)
      }
    })
  }
  get reset() {
    return this.#reset
  }
  #del = <K extends keyof T>(key: K) => {
    // @ts-ignore
    this.#set(key, undefined)
  }
  get del() {
    return this.#del
  }
  #watch = <KS extends (keyof T)[]>(
    keys: KS,
    listener: (data: IReactiveStoreWatchCallbackData<T, KS>) => void
  ) => {
    const { on, get } = this
    const uniqueKeys = Array.from(new Set(keys))
    const cancelMethods = uniqueKeys.map((key) => {
      return on(key, () => {
        const patialData: Partial<IReactiveStoreWatchCallbackData<T, KS>> = {}
        uniqueKeys.map((e) => {
          patialData[e] = get(e)
        })
        const data = patialData as IReactiveStoreWatchCallbackData<T, KS>
        listener(data)
      })
    })
    return () => {
      cancelMethods.map((e) => e())
    }
  }
  get watch() {
    return this.#watch
  }

  #watchAll = (listener: (data: T) => void) => {
    const eventName = this.#getAllChangeEventName()
    return this.#emitter.listen(eventName, listener)
  }
  get watchAll() {
    return this.#watchAll
  }

  #getHandler = <K extends keyof T>(key: K) => {
    const get = () => {
      return this.get(key)
    }
    const set = (value: T[K]) => {
      return this.set(key, value)
    }
    const on = (listener: (value: T[K]) => void) => {
      return this.on(key, listener)
    }
    return {
      get get() {
        return get
      },
      get set() {
        return set
      },
      get on() {
        return on
      }
    }
  }
  get getHandler() {
    return this.#getHandler
  }
}

const s = new ReactiveStore({
  data: { ss: 'ss' },
  valueProcesser: {
    ss: (key, value, data) => {
      return value
    }
  }
})

export type IReactiveStore<T extends object> = ReturnType<typeof createReactiveStore<T>>

export const createReactiveStore = <T extends object>(
  data: T,
  handler?: {
    get?: <K extends keyof T>(key: K, value: T[K]) => T[K]
  }
) => {
  type IKeys = keyof T
  const store: T = { ...data }

  const emitter = new Emitter()
  const getEventName = <K extends IKeys>(key: K) => {
    return `on_${key.toString()}_change`
  }
  const get = <K extends IKeys>(key: K) => {
    const value = store[key]
    return handler?.get?.(key, value) || value
  }
  const set = <K extends IKeys>(key: K, value: T[K]) => {
    store[key] = value
    emit(key, value)
  }
  const del = <K extends IKeys>(key: K) => {
    // @ts-ignore
    set(key, undefined)
  }
  const defaultProcessValue = <T>(value: T) => value
  const getHandler = <K extends IKeys>(key: K, processValue?: (value: T[K]) => T[K]) => {
    const _processValue = processValue || defaultProcessValue
    return {
      get: () => {
        return _processValue(get(key))
      },
      set: (value: T[K]) => {
        return set(key, _processValue(value))
      },
      on: (listener: (value: T[K]) => void) => {
        return on(key, listener)
      },
      emit: (value: T[K]) => {
        return emit(key, _processValue(value))
      }
    }
  }
  const on = <K extends IKeys>(key: K, listener: (data: T[K]) => void) => {
    const eventName = getEventName(key)
    return emitter.listen(eventName, listener)
  }
  const emit = <K extends IKeys>(key: K, data: T[K]) => {
    const eventName = getEventName(key)
    emitter.emit(eventName, data)
  }
  type IWatchCallbackData<KS extends IKeys[]> = {
    [key in KS[number]]: T[key]
  }
  const watch = <KS extends IKeys[]>(
    keys: KS,
    listener: (data: IWatchCallbackData<KS>) => void
  ) => {
    const uniqueKeys = Array.from(new Set(keys))
    const cancelMethods = uniqueKeys.map((key) => {
      return on(key, () => {
        const patialData: Partial<IWatchCallbackData<KS>> = {}
        uniqueKeys.map((e) => {
          patialData[e] = get(e)
        })
        const data = patialData as IWatchCallbackData<KS>
        listener(data)
      })
    })
    return () => {
      cancelMethods.map((e) => e())
    }
  }
  const reset = (object: T) => {
    const newKeys = Object.keys(object) as IKeys[]
    const oldKeys = Object.keys(store) as IKeys[]
    const allKeys = Array.from(new Set([...newKeys, ...oldKeys]))
    allKeys.map((key) => {
      if (newKeys.includes(key)) {
        set(key, object[key])
      } else {
        del(key)
      }
    })
  }
  return {
    on,
    emit,
    get,
    set,
    watch,
    getHandler,
    reset
  }
}
// const aa = createReactiveStore({
//   a: 1,
//   b: 'sss',
//   c: false
// })

// const a = aa.get('a')

// aa.watch(['a', 'a', 'c'], (s) => {
//   s.c
// })

// class Test extends Reactive<Test> {
//     #a: string
//     constructor() {
//         super()
//         this.#a = "s"
//     }
//     get a() {
//         return this.#a
//     }
//     set a(value: string) {
//         this.#a = value
//         this.emitPropertyChange("a", this.a)
//     }
//     get test() {
//         this.onPropertyChange("a", data => {
//             console.log(data)
//         })
//         return () => { }
//     }
// }
