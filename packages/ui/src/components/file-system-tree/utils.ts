import type { IVirtulFileSystem } from '@vue-cook/core'

export interface IItem<T = any> {
  id: string
  parentId: string
  isRoot: boolean
  isLeaf: boolean
  label: string
  value: T
  children?: IItem<T>[]
}
export function listToTree<T>(list: IItem<T>[]) {
  const idToIndex: Record<string, number> = {}
  let node = undefined
  let roots: IItem<T>[] = []
  const initList = list.map((e, i) => {
    idToIndex[e.id] = i
    return { ...e, children: [] as IItem<T>[] | undefined }
  })

  for (let i = 0; i < initList.length; i += 1) {
    node = initList[i]
    if (node.isLeaf) {
      node.children = undefined
    }
    if (node.isRoot) {
      roots.push(node)
    } else {
      initList[idToIndex[node.parentId]].children!.push(node)
    }
  }
  return roots
}

export const getAllPaths = (filePath: string) => {
  const allPathPoints = filePath.split('/')
  let allPaths: string[] = []
  allPathPoints.map((_key, index) => {
    allPaths[index] = allPathPoints.slice(0, index + 1).join('/')
  })
  return allPaths
}

export const isDir = (vfs: IVirtulFileSystem, path: string) => {
  const fs = vfs.getFs()
  if (!fs.existsSync(path)) {
    return false
  }
  const isFile = fs.lstatSync(path).isFile()
  if (!isFile) {
    return true
  }
  return false
}
