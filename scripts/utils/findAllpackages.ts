import path from 'path'
import { readdir } from 'fs/promises'
import { resolvePkgJson } from './resolvePkgJson'
import isDir from './isDir'

export const findAllPkgs = async () => {
  // const workspaceDirs = ['./packages', './examples']
  const workspaceDirs = ['./packages']
  const absolutePaths = workspaceDirs.map(e => path.resolve(e))
  const pkgDirs: string[] = []
  await Promise.all(
    absolutePaths.map(async e => {
      const dirList = (await readdir(e))
        .map(t => path.resolve(e, t))
        .filter(e => {
          return isDir(e)
        })
      pkgDirs.push(...dirList)
    })
  )
  const pkgDirWithNamaList: {
    name: string | undefined
    path: string
  }[] = []
  await Promise.all(
    pkgDirs.map(async e => {
      const pkgJsonPath = path.join(e, './package.json')
      const { name } = (await resolvePkgJson(pkgJsonPath)) || {}
      pkgDirWithNamaList.push({
        name,
        path: e
      })
    })
  )

  return pkgDirWithNamaList
}
