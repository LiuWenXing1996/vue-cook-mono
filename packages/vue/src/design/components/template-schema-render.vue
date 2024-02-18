<template>
  <component :is="cmpt">
    <template v-for="schemaItem in templateSchema?.children">
      <template-schema-render
        :template-schema="schemaItem"
        :states="states"
        :components="components"
      />
    </template>
  </component>
</template>
<script setup lang="ts">
import { getCurrentInstance, toRefs, onMounted, computed, onUpdated, type Component } from 'vue'
import { type ITemplateSchema } from '@vue-cook/core'
const props = defineProps<{
  templateSchema: ITemplateSchema
  states: Record<string, any>
  components: {
    [tag: string]: Component
  }
}>()
const { templateSchema, components } = toRefs(props)
const cmpt = computed(() => {
  const { tag } = templateSchema.value
  const view = components.value[tag]
  return view || tag || ''
})

onMounted(() => {
  const internalInstance = getCurrentInstance()
  // if (internalInstance) {
  //     const elements = getComponentElements(internalInstance)
  //     elements.forEach(el => {
  //         rendererApp.value.elementToTreeSchemaNodeMap.set(el, schemaNode.value)
  //     })
  //     rendererApp.value.templateTreeSchemaNodeIdToInstanceMap.set(schemaNode.value.id, internalInstance)
  // }
})
onUpdated(() => {
  const internalInstance = getCurrentInstance()
  // if (internalInstance) {
  //     const elements = getComponentElements(internalInstance)
  //     elements.forEach(el => {
  //         rendererApp.value.elementToTreeSchemaNodeMap.set(el, schemaNode.value)
  //     })
  //     rendererApp.value.templateTreeSchemaNodeIdToInstanceMap.set(schemaNode.value.id, internalInstance)
  // }
})
</script>
