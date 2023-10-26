<template>
    <template v-if="config.text">
        {{ config.text }}
    </template>
    <template v-else-if="cmpt">
        <component :is="cmpt" v-bind="attributes" v-on="emits">
            <template v-for="(slot, name) in config?.slots" v-slot:[name]>
                <template-render :config="_config" v-for="_config in slot" :dev="dev" :component-map="componentMap"
                    :var-map="varMap"></template-render>
            </template>
        </component>
    </template>
</template>
<script setup lang="ts">
import { getCurrentInstance, toRefs, onMounted, computed, inject, onUpdated, type Component } from "vue";
import { type ITemplateConfig } from "@vue-cook/core"
const props = defineProps<{
    config: ITemplateConfig,
    componentMap: Map<string, Component>,
    varMap: Map<string, any>,
    dev: boolean,
}>()
const { config, dev, componentMap, varMap } = toRefs(props)

const attributes = computed(() => {
    const attributesConfig = config.value.attributes || {}
    let res: Record<string, any> = {}
    Object.keys(attributesConfig).map(key => {
        const config = attributesConfig[key]
        if (config.isVar) {
            const value = config.value as string
            res[key] = varMap.value.get(value)
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
    return view || tag || ""
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

if (dev.value) {
    // onMounted(() => {
    //     const internalInstance = getCurrentInstance()
    //     if (internalInstance) {
    //         const elements = getComponentElements(internalInstance)
    //         elements.forEach(el => {
    //             ElementToComponentUidMap.set(el, config.value.uid)
    //         })
    //         ComponentUidToInstanceMap.set(config.value.uid, internalInstance)
    //     }
    // })
    // onUpdated(() => {
    //     const internalInstance = getCurrentInstance()
    //     if (internalInstance) {
    //         const elements = getComponentElements(internalInstance)
    //         elements.forEach(el => {
    //             ElementToComponentUidMap.set(el, config.value.uid)
    //         })
    //         ComponentUidToInstanceMap.set(config.value.uid, internalInstance)
    //     }
    // })
}


</script>