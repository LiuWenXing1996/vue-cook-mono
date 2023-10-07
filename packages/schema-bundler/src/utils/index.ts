export interface NotAFunction {
  [k: string]: unknown
  bind?: never
  call?: never
}

export type MaybePromise<T> = T | Promise<T>

export type DeepLevel2Partial<T> = T extends object
  ? {
      [P in keyof T]?: Partial<T[P]>
    }
  : T