import {
  ConcurrentlyCommandInput,
  ConcurrentlyOptions,
  concurrently
} from 'concurrently'

export const concurrentlyAsync = async (
  commands: ConcurrentlyCommandInput[],
  options?: Partial<ConcurrentlyOptions>
) => {
  const { result } = concurrently(commands, options)

  return new Promise((resolve, reject) => {
    result.then(
      () => {
        resolve(true)
      },
      e => {
        reject(e)
      }
    )
  })
}
