import path from 'path'
import { getRunPath } from './getRunPath'
import { resolvePkgJson } from './resolvePkgJson'

export const getPkgName = async () => {
  const runPath = getRunPath()
  const pkgJsonPath = path.join(runPath, './package.json')
  const pkgJson = await resolvePkgJson(pkgJsonPath)
  return pkgJson?.name || 'unkonwn pkg name'
}
