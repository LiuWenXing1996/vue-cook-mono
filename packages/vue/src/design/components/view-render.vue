<template>
  <template-schema-render
    v-for="templateSchema in templateSchemaList"
    :template-schema="templateSchema"
    :states="states"
    :components="components"
  />
</template>
<script setup lang="ts">
import { toRefs, shallowRef, computed, watch, type Component } from 'vue'
import TemplateSchemaRender from './template-schema-render.vue'
import { type IViewSchemaFile, Context, type IViewSchema } from '@vue-cook/core'
const props = defineProps<{
  schemaFile: IViewSchemaFile
  designComponents: {
    [path: string]: Component
  }
}>()
const { schemaFile } = toRefs(props)
const states = shallowRef({})
// TODO:实现components
const components = shallowRef<{
  [tag: string]: Component
}>({})
const templateSchemaList = computed(() => {
  return schemaFile.value.content.template
})

watch(
  schemaFile,
  () => {
    const { states: statesSchema = [] } = schemaFile.value.content.context
    const statesObj: Record<string, any> = {}
    statesSchema.map((e) => {
      statesObj[e.name] = e.schema.content
    })
    states.value = statesObj
  },
  {
    immediate: true
  }
)
</script>
