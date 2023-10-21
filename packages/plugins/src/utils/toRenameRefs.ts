import { toRefs, type ToRef } from 'vue'

export type ToRenameRefs<T> = { [P in keyof T & string as `${P}Ref`]: ToRef<T[P]> }

export const toRenameRefs = <T extends object>(object: T): ToRenameRefs<T> => {
  const refs = toRefs(object)
  const renameRefs: Record<string, any> = {}

  for (const key in refs) {
    if (Object.prototype.hasOwnProperty.call(refs, key)) {
      renameRefs[`${key}Ref`] = refs[key]
    }
  }
  return renameRefs as ToRenameRefs<T>
}
