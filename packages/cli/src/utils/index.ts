import { existsSync, lstatSync } from 'fs-extra'
import { flattenDeep, some } from 'lodash'
import { readFile, readdir } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import { minimatch } from 'minimatch'

export const isDir = (path: string) => {
  if (!existsSync(path)) {
    return false
  }
  const isFile = lstatSync(path).isFile()
  if (!isFile) {
    return true
  }
  return false
}

export const isIgnorePath = (path: string, ignorePaths: string[]) => {
  return some(ignorePaths, e => {
    const realtivePath = relative(resolve(), path)
    return minimatch(realtivePath, e)
  })
}

export const getFiles = async (path: string, ignorePaths: string[]) => {
  const res: string[] = []
  if (isIgnorePath(path, ignorePaths)) {
    return res
  }
  if (!isDir(path)) {
    return res
  }
  const fileList: string[] = []
  const dirList: string[] = []
  const childFileList = (await readdir(path)).map(e => resolve(path, e))
  childFileList.map(e => {
    if (isDir(e)) {
      dirList.push(e)
    } else {
      fileList.push(e)
    }
  })
  res.push(...fileList)
  const childFiles = await Promise.all(
    dirList.map(async e => {
      return await getFiles(e, ignorePaths)
    })
  )
  const childFilesFlatted = flattenDeep(childFiles)
  res.push(...childFilesFlatted)

  return res
}

export const getFielsContent = async (pathList: string[]) => {
  const fielsContent = await Promise.all(
    pathList.map(async e => {
      let content: string | undefined = undefined
      try {
        content = await readFile(e, 'utf-8')
      } catch (e) {
        content = ''
      }
      return {
        path: e,
        content
      }
    })
  )
  return fielsContent
}
