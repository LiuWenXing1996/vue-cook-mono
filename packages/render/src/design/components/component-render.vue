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
const actions = shallowRef<Record<string, Function | undefined>>(renderer.value.actions)
const states = shallowRef<Record<string, any>>(renderer.value.states)
const components = shallowRef<Record<string, Component | undefined>>(renderer.value.components)
const schema = shallowRef<IViewSchema | undefined>(renderer.value.schema?.content)
const templateTree = computed(() => {
    return templateSchemaToTree(schema.value?.template || [])
})


renderer.value.onActionsChange((data) => actions.value = { ...data })
renderer.value.onStatesChange((data) => states.value = { ...data })
renderer.value.onComponentsChange((data) => components.value = { ...data })
renderer.value.onSchemaChange((data) => {
    schema.value = data?.content
})


</script>