<template>
    <component :is="cmpt" v-bind="propsData" v-on="eventsData">
        <template v-for="slotNode in schemaNode?.children" v-slot:[slotNode.content.name]="slotProps">
            <template-render :schema-node="_schemaNode" v-for="_schemaNode in slotNode.children" :renderer-app="rendererApp"
                :slotProps="slotProps" :view-context="viewContext"></template-render>
        </template>
    </component>
</template>
<script setup lang="ts">
import { getCurrentInstance, toRefs, onMounted, computed, onUpdated, type Component } from "vue";
import { type IRendererApp, type ITemplateTreeSchemaNode, type IViewContext } from "@vue-cook/core"
import { getComponentElements } from "../utils/getComponentElements"
import { useViewDataMap } from "../hooks/useViewDataMap";
import { useCmpt } from "../hooks/useCmpt";
import type { RendererApp } from "../renderer-app";
// TODO:实现v-for和v-if的转换
const props = defineProps<{
    schemaNode: ITemplateTreeSchemaNode,
    rendererApp: RendererApp,
    viewContext: IViewContext
}>()
const { schemaNode, rendererApp, viewContext } = toRefs(props)
const schema = computed(() => schemaNode.value.content)
const propsSchema = computed(() => schema.value.attributes?.props)
const propsData = useViewDataMap({ schema: propsSchema, viewContext, rendererApp })
const eventsSchema = computed(() => schema.value.attributes?.events)
const eventsData = useViewDataMap({ schema: eventsSchema, viewContext, rendererApp })
const cmpt = useCmpt({ schema, viewContext })

onMounted(() => {
    const internalInstance = getCurrentInstance()
    if (internalInstance) {
        const elements = getComponentElements(internalInstance)
        elements.forEach(el => {
            rendererApp.value.elementToTreeSchemaNodeMap.set(el, schemaNode.value)
        })
        rendererApp.value.templateTreeSchemaNodeIdToInstanceMap.set(schemaNode.value.id, internalInstance)
    }
})
onUpdated(() => {
    const internalInstance = getCurrentInstance()
    if (internalInstance) {
        const elements = getComponentElements(internalInstance)
        elements.forEach(el => {
            rendererApp.value.elementToTreeSchemaNodeMap.set(el, schemaNode.value)
        })
        rendererApp.value.templateTreeSchemaNodeIdToInstanceMap.set(schemaNode.value.id, internalInstance)
    }
})


</script>