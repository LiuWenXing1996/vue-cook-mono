import { cookScriptsPkgName } from './constValues'
import { concurrentlyAsync } from './concurrentlyAsync'

export const cookScriptsBuild = async () => {
  return await concurrentlyAsync(
    [
      {
        command: `pnpm --filter '${cookScriptsPkgName}' build`
      }
    ],
    {
      raw: true
    }
  )
}
