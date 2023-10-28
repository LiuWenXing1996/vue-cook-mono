<template>
    <template v-if="config.text">
        {{ config.text }}
    </template>
    <template v-else-if="cmpt">
        <component :is="cmpt" v-bind="attributes" v-on="emits">
            <template v-for="(slot, name) in config?.slots" v-slot:[name]>
                <template-render :config="_config" v-for="_config in slot" :component-map="componentMap"
                    :state-map="stateMap"></template-render>
            </template>
        </component>
    </template>
</template>
<script setup lang="ts">
import { getCurrentInstance, toRefs, onMounted, computed, inject, onUpdated, type Component, h } from "vue";
import { type IComponentMap, type IStateMap, type ITemplateConfig } from "@vue-cook/core"
import TemplateRender from "./TemplateRender.vue"
import { getComponentElements } from "@/utils/getComponentElements"
const props = defineProps<{
    config: ITemplateConfig,
    stateMap: IStateMap,
    componentMap: IComponentMap<Component>,
}>()
const { config, componentMap, stateMap } = toRefs(props)

const attributes = computed(() => {
    const attributesConfig = config.value.attributes || {}
    let res: Record<string, any> = {}
    Object.keys(attributesConfig).map(key => {
        const config = attributesConfig[key]
        if (config.isVar) {
            const value = config.value as string
            res[key] = stateMap.value.get(value)
        } else {
            try {
                res[key] = JSON.parse(config.value)
            } catch (error) {
            }
        }
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
const emits = computed(() => {
    const res: Record<string, Function> = {}
    const _emits = config.value.events || {}
    // for (const key in _emits) {
    //     if (Object.prototype.hasOwnProperty.call(_emits, key)) {
    //         const logidConfigList = _emits[key];
    //         res[key] = (...payload: []) => {
    //             logidConfigList.map((logicConfig) => {
    //                 try {
    //                     logicRun(cookPlayerState, logicConfig, ...payload)
    //                 } catch (error) {
    //                     console.error(error)
    //                 }
    //             })
    //         }
    //     }
    // }
    return res
})

onMounted(() => {
    const internalInstance = getCurrentInstance()
    if (internalInstance) {
        const elements = getComponentElements(internalInstance)
        elements.forEach(el => {
            ElementToComponentUidMap.set(el, config.value.uid)
        })
        ComponentUidToInstanceMap.set(config.value.uid, internalInstance)
    }
})
onUpdated(() => {
    const internalInstance = getCurrentInstance()
    if (internalInstance) {
        const elements = getComponentElements(internalInstance)
        elements.forEach(el => {
            ElementToComponentUidMap.set(el, config.value.uid)
        })
        ComponentUidToInstanceMap.set(config.value.uid, internalInstance)
    }
})


</script>