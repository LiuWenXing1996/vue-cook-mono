import { findAllPkgs } from '../utils/findAllpackages'
import { cookScriptsBuild } from '../utils/cookScriptsBuild'
import { cookScriptsPkgName } from '../utils/constValues'
import { concurrentlyAsync } from '../utils/concurrentlyAsync'

export const build = async () => {
  await cookScriptsBuild()
  const allPkgs = await findAllPkgs()
  const commands = allPkgs
    .filter(e => e.name)
    .filter(e => e.name !== cookScriptsPkgName)
    .map(e => {
      return {
        command: `"pnpm --filter '${e.name}' build"`
      }
    })
  return await concurrentlyAsync([...commands], {
    raw: true
  })
}
