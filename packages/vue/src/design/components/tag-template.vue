<template>
    <template v-if="schema.type === 'Tag'">
        <template v-if="cmpt">
            <component :is="cmpt" v-bind="attributes" v-on="events">
                <template v-for="slotNode in schemaNode?.children" v-slot:[slotNode.content.name]="slotProps">
                    <template-render :schema-node="_schemaNode" v-for="_schemaNode in slotNode.children"
                        :renderer="renderer" :slotProps="slotProps" :view-context="viewContext"></template-render>
                </template>
            </component>
        </template>
    </template>
</template>
<script setup lang="ts">
import { toRefs, computed, type Component, shallowRef, watch, shallowReactive, ref } from "vue";
import { type IAttributeSchema, type ITemplateTreeSchemaNode, type IViewContext, type IViewData } from "@vue-cook/core"
import TemplateRender from "./template-render.vue"
import type { Renderer } from "../renderer";
import { useEvents } from "../hooks/useEvents"
// TODO:实现v-for和v-if的转换
const props = defineProps<{
    schemaNode: ITemplateTreeSchemaNode,
    renderer: Renderer,
    slotProps?: Record<string, any>
    viewContext: IViewContext
}>()
const { schemaNode, renderer, viewContext } = toRefs(props)
console.log(schemaNode.value.id, schemaNode.value)
const schema = computed(() => schemaNode.value.content)
const attributeViewDataMap = renderer.value.createViewDataMap(viewContext.value)
const attributes = shallowRef<Record<string, any>>(attributeViewDataMap.getValue() || {})
console.log("schema", JSON.stringify(schema.value));

attributeViewDataMap.onValueChange(() => {
    attributes.value = attributeViewDataMap.getValue() || {}
})
watch(schema, () => {
    let attributesList: IAttributeSchema[] = []
    if (schema.value.type === "Tag") {
        attributesList = schema.value.attributes || []
    }
    attributeViewDataMap.setSchema(attributesList)
}, {
    immediate: true
})



const events = useEvents({ schema, viewContext, renderer })

const getCmpt = () => {
    if (schema.value.type !== "Tag") {
        return ""
    }
    const { tag } = schema.value
    const view = viewContext.value.components.get(tag)
    return view || tag || ""
}
watch([schema, viewContext], () => {
    cmpt.value = getCmpt()
})

const cmpt = ref(getCmpt())


// const cmpt = computed(() => {
//     if (schema.value.type !== "Tag") {
//         return ""
//     }
//     const { tag } = schema.value
//     // const view = components.value[tag]
//     // return view || tag || ""
//     return tag || ""
// })

</script>