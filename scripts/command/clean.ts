import { findAllPkgs } from '../utils/findAllpackages'
import { cookScriptsBuild } from '../utils/cookScriptsBuild'
import { cookScriptsPkgName } from '../utils/constValues'
import { concurrentlyAsync } from '../utils/concurrentlyAsync'
import { cookScriptsClean } from '../utils/cookScriptsClean'

export const clean = async () => {
  await cookScriptsBuild()
  const allPkgs = await findAllPkgs()
  const commands = allPkgs
    .filter(e => e.name)
    .filter(e => e.name !== cookScriptsPkgName)
    .map(e => {
      return {
        command: `"pnpm --filter '${e.name}' clean"`
      }
    })
  for (let i = 0; i < commands.length; i++) {
    const command = commands[i]
    await concurrentlyAsync([command], {
      raw: true
    })
  }

  return await cookScriptsClean()
}
