import { Static, Type, create } from './type'

export interface ArrayType<E extends Type = Type> extends Type<Static<E>[]> {
  tag: 'array'
  element: E
}

export type ArrayTypeConfig<E extends Type = Type> = Pick<
  ArrayType<E>,
  'element'
>

export const Array = <E extends Type>(config: ArrayTypeConfig<E>) => {
  const { element } = config
  return create<ArrayType<E>>({
    element
  })
}
