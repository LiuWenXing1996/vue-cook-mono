import { cookScriptsPkgName } from './constValues'
import { concurrentlyAsync } from './concurrentlyAsync'

export const cookScriptsClean = async () => {
  return await concurrentlyAsync(
    [
      {
        command: `pnpm --filter '${cookScriptsPkgName}' clean`
      }
    ],
    {
      raw: true
    }
  )
}
