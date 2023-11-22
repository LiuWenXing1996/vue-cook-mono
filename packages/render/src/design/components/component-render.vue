<template>
    <template-render v-for="schemaNode in templateTree" :schema-node="schemaNode" :actions="actions" :states="states"
        :components="components" :renderer="renderer" />
</template>
<script setup lang="ts">
import { toRefs, type Component, shallowRef, computed, watch } from "vue";
import TemplateRender from "./template-render.vue";
import type { Renderer } from "../renderer";
import { type IViewSchema, templateSchemaToTree, type IViewFileSchema } from "@vue-cook/core";
const props = defineProps<{
    renderer: Renderer,
    schema: IViewFileSchema
}>()
const { renderer, schema } = toRefs(props)
const actions = shallowRef(renderer.value.transferActions(schema.value.content.actions || [], schema.value))
const states = shallowRef(renderer.value.transferStates(schema.value.content.states || []))
const components = shallowRef(renderer.value.transferAliasComponents(schema.value.content.components || [], schema.value))
const templateTree = computed(() => {
    return templateSchemaToTree(schema.value?.content.template || [])
})



</script>