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

export const createReactiveStore = <T extends object>(data: T) => {
  type IKeys = keyof T
  const store: T = { ...data }

  const emitter = new Emitter()
  const getEventName = <K extends IKeys>(key: K) => {
    return `on_${key.toString()}_change`
  }
  const get = <K extends IKeys>(key: K) => {
    return store[key]
  }
  const set = <K extends IKeys>(key: K, value: T[K]) => {
    store[key] = value
    emit(key, value)
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
    return emitter.emit(eventName, data)
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
  return {
    on,
    emit,
    get,
    set,
    watch,
    getHandler
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
