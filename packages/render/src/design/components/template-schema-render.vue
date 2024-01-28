<template>
    <component :is="cmpt" v-bind="propsData" v-on="eventsData">
        <template v-for="schemaItem in schema?.children">
            <template-schema-render :schema="schemaItem" :renderer-app="rendererApp" :view-context="viewContext" />
        </template>
    </component>
</template>
<script setup lang="ts">
import { getCurrentInstance, toRefs, onMounted, computed, onUpdated, type Component } from "vue";
import { type IRendererApp, type ITemplateTreeSchemaNode, type IViewContext, type ITemplateSchema } from "@vue-cook/core"
import { getComponentElements } from "../utils/getComponentElements"
import { useViewDataMap } from "../hooks/useViewDataMap";
import { useCmpt } from "../hooks/useCmpt";
import type { RendererApp } from "../renderer-app";
const props = defineProps<{
    schema: ITemplateSchema,
    rendererApp: RendererApp,
    viewContext: IViewContext
}>()
const { rendererApp, viewContext, schema } = toRefs(props)
const propsSchema = computed(() => schema.value.attributes?.props)
const propsData = useViewDataMap({ schema: propsSchema, viewContext, rendererApp })
const eventsSchema = computed(() => schema.value.attributes?.events)
const eventsData = useViewDataMap({ schema: eventsSchema, viewContext, rendererApp })
const cmpt = useCmpt({ schema, viewContext })

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