import { random, uniqueId } from 'lodash-es'

export const uniqueIdWithRandom = (prefix: string) => {
  const randomNumber = random(1, 10)
  return `${uniqueId(prefix)}__random${randomNumber}`
}
