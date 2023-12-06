<template>
    <component :is="cmpt" v-bind="propsData" v-on="eventsData">
        <template v-for="slotNode in schemaNode?.children" v-slot:[slotNode.content.name]="slotProps">
            <template-render :schema-node="_schemaNode" v-for="_schemaNode in slotNode.children" :renderer="renderer"
                :slotProps="slotProps" :view-context="viewContext"></template-render>
        </template>
    </component>
</template>
<script setup lang="ts">
import { getCurrentInstance, toRefs, onMounted, computed, onUpdated, type Component } from "vue";
import { type ITemplateTreeSchemaNode, type IViewContext } from "@vue-cook/core"
import { getComponentElements } from "../utils/getComponentElements"
import type { Renderer } from "../renderer";
import { useViewDataMap } from "../hooks/useViewDataMap";
import { useCmpt } from "../hooks/useCmpt";
// TODO:实现v-for和v-if的转换
const props = defineProps<{
    schemaNode: ITemplateTreeSchemaNode,
    renderer: Renderer,
    viewContext: IViewContext
}>()
const { schemaNode, renderer, viewContext } = toRefs(props)
const schema = computed(() => schemaNode.value.content)
const propsSchema = computed(() => schema.value.attributes?.props)
const propsData = useViewDataMap({ schema: propsSchema, viewContext, renderer })
const eventsSchema = computed(() => schema.value.attributes?.events)
const eventsData = useViewDataMap({ schema: eventsSchema, viewContext, renderer })
const cmpt = useCmpt({ schema, viewContext })


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