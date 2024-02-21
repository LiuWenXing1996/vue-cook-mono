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
import { pascalCase } from 'pascal-case'
import { type IViewSchemaFile, Context, type IViewSchema, path, type IDeps } from '@vue-cook/core'
const props = defineProps<{
  schemaFile: IViewSchemaFile
  designComponents: {
    [path: string]: Component | undefined
  }
  deps: {
    [path: string]: any
  }
}>()
const { schemaFile, designComponents, deps } = toRefs(props)
const states = shallowRef({})
// TODO:实现components
// const components = shallowRef<{
//   [tag: string]: Component
// }>({})
const templateSchemaList = computed(() => {
  return schemaFile.value.content.template
})
const components = computed(() => {
  const targetComponents: {
    [tagName: string]: Component | undefined
  } = {}
  const designComponentsValue = designComponents.value
  const depsValue = deps.value
  const { path: schemaFilePath, content: viewSchema } = schemaFile.value
  const { components: aliasComponents = [] } = viewSchema
  aliasComponents.map((aliasComponent) => {
    const aliasComponentAbsolutePath = path.resolve(aliasComponent.path, schemaFilePath)
    let targetComponent = designComponentsValue[aliasComponentAbsolutePath]
    if (!targetComponent) {
      const dep = depsValue[aliasComponent.path]
      if (aliasComponent.type === 'default') {
        targetComponent = dep["default"]
      }
      if (aliasComponent.type === 'destructuring') {
        const exportName = aliasComponent.exportName || pascalCase(aliasComponent.tag)
        targetComponent = dep[exportName]
      }
    }
    targetComponents[aliasComponent.tag] = targetComponent
  })
  return targetComponents
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
