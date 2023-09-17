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

// var entries = [
//   {
//     id: '12',
//     parentId: '0',
//     text: 'Man',
//     level: '1',
//     children: null
//   },
//   {
//     id: '6',
//     parentId: '12',
//     text: 'Boy',
//     level: '2',
//     children: null
//   },
//   {
//     id: '7',
//     parentId: '12',
//     text: 'Other',
//     level: '2',
//     children: null
//   },
//   {
//     id: '9',
//     parentId: '0',
//     text: 'Woman',
//     level: '1',
//     children: null
//   },
//   {
//     id: '11',
//     parentId: '9',
//     text: 'Girl',
//     level: '2',
//     children: null
//   }
// ]
