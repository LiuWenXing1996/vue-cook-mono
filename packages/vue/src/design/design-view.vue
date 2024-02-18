<template>
  <template v-if="schemaFile">
    <view-render :schema-file="schemaFile" :components="{}" :design-components="{}" />
  </template>
</template>
<script setup lang="ts">
import { ref, shallowRef, toRefs, watch } from 'vue'
import ViewRender from './components/view-render.vue'
import type { IVirtulFileSystem, IViewSchemaFile, IViewSchema } from '@vue-cook/core'
import type { FSWatcher } from 'node:fs'
const props = defineProps<{
  vfs: IVirtulFileSystem
  mainViewFilePath: string
}>()
const { vfs, mainViewFilePath } = toRefs(props)
const schemaFile = shallowRef<IViewSchemaFile>()
const currentFsWatcher = ref<FSWatcher>()
const getSchemaFile = async (params: { vfs: IVirtulFileSystem; mainViewFilePath: string }) => {
  const { vfs, mainViewFilePath } = params
  const schema = (await vfs.readYaml(mainViewFilePath)) as IViewSchema
  return schema
}

watch([vfs, mainViewFilePath], ([vfs, mainViewFilePath]) => {
  currentFsWatcher.value?.close()
  const fs = vfs.getFs()
  currentFsWatcher.value = fs.watch('/', {}, () => {
    getSchemaFile({ vfs, mainViewFilePath }).then((res) => {
      schemaFile.value = {
        path: mainViewFilePath,
        content: res
      }
    })
  })
  getSchemaFile({ vfs, mainViewFilePath }).then((res) => {
    schemaFile.value = {
      path: mainViewFilePath,
      content: res
    }
  })
})
</script>
