<template>
    <template-render v-for="schemaNode in templateTree" :schema-node="schemaNode" :actions="actions" :states="states"
        :components="components" :renderer="renderer" />
</template>
<script setup lang="ts">
import { toRefs, type Component, shallowRef, computed } from "vue";
import TemplateRender from "./template-render.vue";
import type { Renderer } from "../renderer";
import { type IViewSchema, templateSchemaToTree } from "@vue-cook/core";
const props = defineProps<{
    renderer: Renderer
}>()

const { renderer } = toRefs(props)
const actions = shallowRef<Record<string, Function | undefined>>({})
const states = shallowRef<Record<string, any>>({})
const components = shallowRef<Record<string, Component | undefined>>({})
const schema = shallowRef<IViewSchema>()
const templateTree = computed(() => {
    return templateSchemaToTree(schema.value?.template || [])
})


renderer.value.onActionsChange((data) => actions.value = { ...data })
renderer.value.onStatesChange((data) => states.value = { ...data })
renderer.value.onComponentsChange((data) => components.value = { ...data })
renderer.value.onSchemaChange((data) => schema.value = data?.content)


</script>