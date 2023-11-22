<template>
    <template v-if="schema.type === 'Tag'">
        <template v-if="cmpt">
            <component :is="cmpt" v-bind="attributes" v-on="events">
                <template v-for="slotNode in schemaNode?.children" v-slot:[slotNode.content.name]="slotProps">
                    <template-render :schema-node="_schemaNode" v-for="_schemaNode in slotNode.children" :actions="actions"
                        :states="states" :components="components" :renderer="renderer"
                        :slotProps="slotProps"></template-render>
                </template>
            </component>
        </template>
    </template>
</template>
<script setup lang="ts">
import { toRefs, computed, type Component } from "vue";
import { type ITemplateTreeSchemaNode } from "@vue-cook/core"
import TemplateRender from "./template-render.vue"
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
console.log("...", schemaNode)
const schema = computed(() => schemaNode.value.content)

const attributes = computed(() => {
    let res: Record<string, any> = {}
    if (schema.value.type === "Tag") {
        const attributesList = schema.value.attributes || []
        attributesList.map(attributesSchema => {
            res[attributesSchema.name] = renderer.value.transferAttribute(attributesSchema, {
                states: states.value,
                i18ns: []
            })
        })
    }
    return res
})

const events = computed(() => {
    let res: Record<string, any> = {}
    if (schema.value.type === "Tag") {
        const attributesList = schema.value.events || []
        attributesList.map(attributesSchema => {
            res[attributesSchema.name] = renderer.value.transferAttribute(attributesSchema, {
                states: states.value,
                i18ns: []
            })
        })
    }
    return res
})

const cmpt = computed(() => {
    if (schema.value.type !== "Tag") {
        return ""
    }
    const { tag } = schema.value
    const view = components.value[tag]
    return view || tag || ""
})

</script>