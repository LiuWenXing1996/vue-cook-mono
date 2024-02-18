<template>
    <template v-if="config.text">
        {{ config.text }}
    </template>
    <template v-else-if="config.for">
        <template-render :schema-node="_configWithNoFor" v-for="item in config?.for.data" :component-map="componentMap"
            :state-map="stateMap" :renderer="renderer" :slotProps="slotProps" :forItem="item"></template-render>
    </template>
    <template v-else-if="config.if">
        <!-- /* dev状态要可以强制渲染出来 */ -->
        <!-- /* v-show 怎么表示下 */ -->
        <!-- /* 一些状态的值要透传进去 */ -->
        <template-render v-if="config.if.data" :schema-node="_configWithNoIf" v-for="item in config?.for.data"
            :component-map="componentMap" :state-map="stateMap" :renderer="renderer" :slotProps="slotProps"
            :forItem="item"></template-render>
    </template>
    <template v-else-if="cmpt">
        <component :is="cmpt" v-bind="attributes">
            <template v-for="(slot, name) in config?.slots" v-slot:[name]="slotProps">
                <template-render :schema-node="_config" v-for="_config in slot" :component-map="componentMap"
                    :state-map="stateMap" :renderer="renderer" :slotProps="slotProps"></template-render>
            </template>
        </component>
    </template>
    <template ref="d"></template>
</template>
<script setup lang="ts">
import { getCurrentInstance, toRefs, onMounted, computed, onUpdated, type Component, h, type ComponentInternalInstance, ref } from "vue";
import { type IComponentMap, type IStateMap, type ITemplateConfigWithPid } from "@vue-cook/core"
import TemplateRender from "./template-render.vue"
import { getComponentElements } from "../utils/getComponentElements"
import type { Renderer } from "../renderer";
// TODO:实现v-for和v-if的转换
const props = defineProps<{
    config: ITemplateConfigWithPid,
    stateMap: IStateMap,
    slotProps: Record<string, any>,
    componentMap: IComponentMap<Component>,
    renderer: Renderer
}>()
const { config, componentMap, stateMap, renderer: rendererRef, slotProps } = toRefs(props)
const renderer = rendererRef.value
const d = ref("")

const attributes = computed(() => {
    const attributesConfig = config.value.attributes || {}
    let res: Record<string, any> = {}
    console.log("attributesConfig", attributesConfig)
    Object.keys(attributesConfig).map(key => {
        const config = attributesConfig[key]
        res[key] = renderer.transferAttributeData(config)
    })

    return res
})

const cmpt = computed(() => {
    if (config.value.text) {
        return ""
    }
    if (!config.value.tag) {
        return ""
    }
    const { tag } = config.value
    const view = componentMap.value.get(tag)
    if (view?.isInnerComponent) {
        const schema = view.schema
        return "inner"
    } else {
        return view?.component || tag || ""
    }
})

onMounted(() => {
    const internalInstance = getCurrentInstance()
    if (internalInstance) {
        const elements = getComponentElements(internalInstance)
        // element
        elements.forEach(el => {
            renderer.elementToTreeSchemaNodeMap.set(el, config.value)
        })
        renderer.templateTreeSchemaNodeIdToInstanceMap.set(config.value.__designPid, internalInstance)
    }
})
onUpdated(() => {
    const internalInstance = getCurrentInstance()
    if (internalInstance) {
        const elements = getComponentElements(internalInstance)
        elements.forEach(el => {
            renderer.elementToTreeSchemaNodeMap.set(el, config.value)
        })
        renderer.templateTreeSchemaNodeIdToInstanceMap.set(config.value.__designPid, internalInstance)
    }
})


</script>