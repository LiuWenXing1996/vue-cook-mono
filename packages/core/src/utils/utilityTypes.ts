export type Equals<T, S> = [T] extends [S]
  ? [S] extends [T]
    ? true
    : false
  : false

export const typeMustTrue = <T extends true>(p: T) => p
