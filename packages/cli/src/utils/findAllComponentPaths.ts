import { basename, resolve } from 'path'
import { readdir } from 'fs/promises'
import { flattenDeep } from 'lodash'
import { isDir } from '.'

const isComponentFile = (path: string) => {
  if (!isDir(path)) {
    return false
  }
  const componentFileNames = ['components', 'pages']
  const baseName = basename(path)
  if (componentFileNames.includes(baseName)) {
    return true
  }
  return false
}
export const findAllComponentPaths = async (rootPath: string) => {
  return await findComponentDirPath(rootPath)
}
const findComponentDirPath = async (path: string) => {
  const res: string[] = []
  if (!isDir(path)) {
    return res
  }
  const fileList = (await readdir(path)).map(e => resolve(path, e))
  const fileDirList = fileList.filter(e => isDir(e))
  if (isComponentFile(path)) {
    res.push(...fileDirList)
  }
  const childrenDir = await Promise.all(
    fileDirList.map(async e => {
      return await findComponentDirPath(e)
    })
  )
  const childrenDirFlatted = flattenDeep(childrenDir)
  res.push(...childrenDirFlatted)
  return res
}
