<template>
    <template-render v-for="schemaNode in templateTree" :schema-node="schemaNode" :renderer="renderer"
        :view-context="viewContext" />
</template>
<script setup lang="ts">
import { toRefs, type Component, shallowRef, computed, watch, h } from "vue";
import TemplateRender from "./template-render.vue";
import TextTag from "./text-tag.vue";
import type { Renderer } from "../renderer";
import { type IViewSchema, templateSchemaToTree, type IViewFileSchema, type IViewContext } from "@vue-cook/core";
const props = defineProps<{
    renderer: Renderer,
    schema: IViewFileSchema
}>()
const { renderer, schema } = toRefs(props)
const viewContext = renderer.value.createViewContext()
const templateTree = computed(() => {
    const tree = templateSchemaToTree(schema.value?.content.template || [])
    console.log("templateTree", tree)
    return tree
})

watch(
    schema,
    () => {
        const { states = [], components = [], actions = [] } = schema.value.content
        const initialStates = renderer.value.transferStates(states)
        viewContext.resetState(initialStates)
        const initialActions = renderer.value.transferActions(actions, schema.value, viewContext)
        viewContext.actions.reset(initialActions)
        const initialCompoents = renderer.value.transferAliasComponents(components, schema.value);
        initialCompoents["text"] = TextTag
        viewContext.components.reset(initialCompoents)
    },
    {
        immediate: true
    }
)

</script>