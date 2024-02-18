<template>
    <template-render v-for="schemaNode in templateTree" :schema-node="schemaNode" :renderer-app="rendererApp"
        :view-context="viewContext" />
</template>
<script setup lang="ts">
import { toRefs, computed, watch } from "vue";
import TemplateRender from "./template-render.vue";
import { templateSchemaToTree, type IViewFileSchema } from "@vue-cook/core";
import type { RendererApp } from "../renderer-app";
const props = defineProps<{
    rendererApp: RendererApp,
    schema: IViewFileSchema
}>()
const { rendererApp, schema } = toRefs(props)
const renderer = rendererApp.value.renderer;
const viewContext = renderer.createViewContext()
const templateTree = computed(() => {
    const tree = templateSchemaToTree(schema.value?.content.template || [])
    console.log("templateTree", tree)
    return tree
})

watch(
    schema,
    () => {
        const { states = [], components = [], actions = [] } = schema.value.content
        const initialStates = renderer.transferStates(states)
        viewContext.resetState(initialStates)
        const initialActions = renderer.transferActions(actions, schema.value, viewContext)
        viewContext.actions.reset(initialActions)
        const initialCompoents = renderer.transferAliasComponents(components, schema.value);
        viewContext.components.reset(initialCompoents)
    },
    {
        immediate: true
    }
)
</script>