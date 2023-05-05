export interface TypeUid<T> {
  value: string
  __only_for_type__: T
}

export const createTypeUid = <T>(uid: string) => {
  const tuid = {
    value: uid
  } as TypeUid<T>
  return tuid
}
