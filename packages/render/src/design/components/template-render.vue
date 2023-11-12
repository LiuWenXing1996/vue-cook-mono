<template>
    <template v-if="schema.text">
        {{ schema.text }}
    </template>

    <template v-else-if="cmpt">
        <component :is="cmpt" v-bind="attributes">
            <template v-for="slotNode in schemaNode?.children" v-slot:[slotNode.content.name]="slotProps">
                <template-render :schema-node="_schemaNode" v-for="_schemaNode in slotNode.children" :actions="actions"
                    :states="states" :components="components" :renderer="renderer" :slotProps="slotProps"></template-render>
            </template>
        </component>
    </template>
    <template ref="d"></template>
</template>
<script setup lang="ts">
import { getCurrentInstance, toRefs, onMounted, computed, onUpdated, type Component } from "vue";
import { type ITemplateTreeSchemaNode } from "@vue-cook/core"
import TemplateRender from "./template-render.vue"
import { getComponentElements } from "../utils/getComponentElements"
import type { Renderer } from "../renderer";
// TODO:实现v-for和v-if的转换
const props = defineProps<{
    schemaNode: ITemplateTreeSchemaNode,
    states: Record<string, any>,
    components: Record<string, Component | undefined>,
    actions: Record<string, Function | undefined>
    renderer: Renderer,
    slotProps?: Record<string, any>
}>()
const { schemaNode, components, states, renderer } = toRefs(props)
const schema = computed(() => schemaNode.value.content)

const attributes = computed(() => {
    const attributesList = schema.value.attributes || []
    let res: Record<string, any> = {}
    attributesList.map(attributesSchema => {
        res[attributesSchema.name] = renderer.value.transferAttributeData(attributesSchema)
    })

    return res
})

const cmpt = computed(() => {
    if (schema.value.text) {
        return ""
    }
    if (!schema.value.tag) {
        return ""
    }
    const { tag } = schema.value
    const view = components.value[tag]
    return view || tag || ""
})

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