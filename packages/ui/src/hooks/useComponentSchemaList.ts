import {
  type IVirtulFileSystem,
  type ISchemaData,
  path,
  type IComponentSchemaConfig
} from '@vue-cook/core'

import { computed, shallowRef } from 'vue'

const getComponentSchemaList = async (params: {
  vfs: IVirtulFileSystem
  componentSchemaFileNames: string[]
}) => {
  const list: ISchemaData['componentList'] = []
  const { vfs, componentSchemaFileNames } = params
  try {
    const allFiles = await vfs.listFiles()
    const schemaFiles = allFiles.filter((e) => componentSchemaFileNames.includes(path.basename(e)))
    await Promise.all(
      schemaFiles.map(async (e) => {
        try {
          const schema = await vfs.readYaml<IComponentSchemaConfig>(e)
          list.push({
            path: e,
            value: schema
          })
        } catch (error) {}
      })
    )
  } catch (error) {}
  return list
}

export const useComponentSchemaList = (params: {
  vfs: IVirtulFileSystem
  componentSchemaFileNames: string[]
}) => {
  const { vfs, componentSchemaFileNames } = params
  const list = shallowRef<ISchemaData['componentList']>([])
  getComponentSchemaList({ vfs, componentSchemaFileNames }).then((res) => {
    list.value = res
  })
  const fs = vfs.getFs()
  fs.watch(
    '/',
    {
      recursive: true
    },
    async () => {
      list.value = await getComponentSchemaList({ vfs, componentSchemaFileNames })
    }
  )

  return computed(() => list.value)
}
