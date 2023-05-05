export type DeepReadonly<T> = {
  readonly [K in keyof T]: keyof T[K] extends never ? T[K] : DeepReadonly<T[K]>
}

export type DeepReadonlyWithUid<C> = DeepReadonly<
  C & {
    uid: string
  }
>

export function deepFreeze<T extends Record<string, any>> (
  value: T
): DeepReadonly<T> {
  Object.freeze(value)

  Object.getOwnPropertyNames(value).forEach(function (prop) {
    if (value.hasOwnProperty(prop)) {
      const propValue = value[prop]
      if (propValue !== null) {
        if (typeof propValue === 'object' || typeof propValue === 'function') {
          if (!Object.isFrozen(propValue)) {
            deepFreeze(propValue)
          }
        }
      }
    }
  })

  return value
}
