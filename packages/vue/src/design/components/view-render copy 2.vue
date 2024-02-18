<template>
    <template-schema-render v-for="templateSchema in templateSchemaList" :schema="templateSchema"
        :renderer-app="rendererApp" :view-context="viewContext" />
</template>
<script setup lang="ts">
import { toRefs, computed, watch } from "vue";
import TemplateSchemaRender from "./template-schema-render.vue";
import { templateSchemaToTree, type IViewFileSchema } from "@vue-cook/core";
import type { RendererApp } from "../renderer-app";
const props = defineProps<{
    rendererApp: RendererApp,
    schema: IViewFileSchema,
    attributes: {
        props: {}
    }
    slots: {}
}>()
const { rendererApp, schema, attributes, slots } = toRefs(props)
const renderer = rendererApp.value.renderer;
const viewContext = renderer.createViewContext()
const templateSchemaList = computed(() => {
    return schema.value.content.template
})
const templateTree = computed(() => {
    const tree = templateSchemaToTree(schema.value?.content.template || [])
    console.log("templateTree", tree)
    return tree
})

watch(
    schema,
    () => {
        const { states = [], components = [] } = schema.value.content.view
        const { actions = {} } = schema.value.content
        const initialStates = renderer.transferStates(states)
        viewContext.resetState(initialStates)
        const initialActions: Record<string, Function> = {}
        Object.keys(actions).map(e => {
            initialActions[e] = renderer.transferAction(actions[e], viewContext)
        })
        viewContext.actions.reset(initialActions)
        const initialCompoents = renderer.transferAliasComponents(components, schema.value);
        viewContext.components.reset(initialCompoents)
    },
    {
        immediate: true
    }
)
</script>