import { Type, create } from './type'

export interface NumberType extends Type<number> {
  tag: 'number'
  min: number
  max: number
}

export type NumberTypeConfig = Partial<Pick<NumberType, 'max' | 'min'>>

export const Number = (config?: NumberTypeConfig) => {
  const { min, max } = config || {}
  return create<NumberType>({ min, max })
}
