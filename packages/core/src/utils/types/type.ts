export const TypeSymbol: unique symbol = Symbol()

export interface Type<T = unknown> {
  readonly [TypeSymbol]: true
  readonly _onlyForType: T,
}

export type Static<T extends Type> = T['_onlyForType']

export const create = <T extends Type>(config: any) => {
  return {
    [TypeSymbol]: true,
    ...config
  } as T
}
