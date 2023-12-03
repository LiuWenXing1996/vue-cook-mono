<template>
    <template v-if="schema.type === 'Text'">
        <text-template :renderer="renderer" :schema="schema" :view-context="viewContext"></text-template>
    </template>
    <template v-if="schema.type === 'Tag'">
        <tag-template :renderer="renderer" :schema-node="schemaNode" :view-context="viewContext"></tag-template>
    </template>
</template>
<script setup lang="ts">
import { getCurrentInstance, toRefs, onMounted, computed, onUpdated, type Component } from "vue";
import { type ITemplateTreeSchemaNode, type IViewContext } from "@vue-cook/core"
import TagTemplate from "./tag-template.vue"
import TextTemplate from "./text-template.vue"
import { getComponentElements } from "../utils/getComponentElements"
import type { Renderer } from "../renderer";
// TODO:实现v-for和v-if的转换
const props = defineProps<{
    schemaNode: ITemplateTreeSchemaNode,
    renderer: Renderer,
    viewContext: IViewContext
}>()
const { schemaNode, renderer } = toRefs(props)
console.log("...", schemaNode)
const schema = computed(() => schemaNode.value.content)

onMounted(() => {
    const internalInstance = getCurrentInstance()
    if (internalInstance) {
        const elements = getComponentElements(internalInstance)
        // element
        elements.forEach(el => {
            renderer.value.elementToTreeSchemaNodeMap.set(el, schemaNode.value)
        })
        renderer.value.templateTreeSchemaNodeIdToInstanceMap.set(schemaNode.value.id, internalInstance)
    }
})
onUpdated(() => {
    const internalInstance = getCurrentInstance()
    if (internalInstance) {
        const elements = getComponentElements(internalInstance)
        elements.forEach(el => {
            renderer.value.elementToTreeSchemaNodeMap.set(el, schemaNode.value)
        })
        renderer.value.templateTreeSchemaNodeIdToInstanceMap.set(schemaNode.value.id, internalInstance)
    }
})


</script>