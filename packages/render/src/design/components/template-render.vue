<template>
    <template v-if="config.text">
        {{ config.text }}
    </template>
    <template v-else-if="cmpt">
        <component :is="cmpt" v-bind="attributes">
            <template v-for="(slot, name) in config?.slots" v-slot:[name]>
                <template-render :config="_config" v-for="_config in slot" :component-map="componentMap"
                    :state-map="stateMap" :renderer="renderer"></template-render>
            </template>
        </component>
    </template>
</template>
<script setup lang="ts">
import { getCurrentInstance, toRefs, onMounted, computed, onUpdated, type Component, h, type ComponentInternalInstance } from "vue";
import { type IComponentMap, type IStateMap, type ITemplateConfigWithPid } from "@vue-cook/core"
import TemplateRender from "./template-render.vue"
import { getComponentElements } from "../utils/getComponentElements"
import type { Renderer } from "../renderer";
const props = defineProps<{
    config: ITemplateConfigWithPid,
    stateMap: IStateMap,
    componentMap: IComponentMap<Component>,
    renderer: Renderer
}>()
const { config, componentMap, stateMap, renderer: rendererRef } = toRefs(props)
const renderer = rendererRef.value

const attributes = computed(() => {
    const attributesConfig = config.value.attributes || {}
    let res: Record<string, any> = {}
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
        elements.forEach(el => {
            renderer.elementToTemplateConfigMap.set(el, config.value)
        })
        renderer.templatePidToInstanceMap.set(config.value.__designPid, internalInstance)
    }
})
onUpdated(() => {
    const internalInstance = getCurrentInstance()
    if (internalInstance) {
        const elements = getComponentElements(internalInstance)
        elements.forEach(el => {
            renderer.elementToTemplateConfigMap.set(el, config.value)
        })
        renderer.templatePidToInstanceMap.set(config.value.__designPid, internalInstance)
    }
})


</script>