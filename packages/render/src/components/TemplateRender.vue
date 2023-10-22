<template>
    <template v-if="config.text">
        {{ config.text }}
    </template>
    <template v-else>
        <component :is="cmpt" v-bind="config?.props" v-on="emits">
            <template v-for="(slot, name) in config?.slots" v-slot:[name]>
                <template-render :config="_config" v-for="_config in slot" :dev="dev"
                    :component-map="componentMap"></template-render>
            </template>
        </component>
    </template>
</template>
<script setup lang="ts">
import { getCurrentInstance, toRefs, onMounted, computed, inject, onUpdated, type Component } from "vue";
import { type ITemplateConfig } from "@vue-cook/core"
const props = defineProps(
    {
        config: {
            type: Object as () => ITemplateConfig,
            required: true
        },
        componentMap: {
            type: Object as () => Map<string, Component>,
            required: true
        },
        dev: {
            type: Boolean,
            default: false
        }
    }
)
const { config, dev, componentMap } = toRefs(props)

const cmpt = computed(() => {
    const { type } = config.value
    let cmptValue: Component | undefined = undefined
    if (type) {
        cmptValue = componentMap.value.get("" + type.packageName || "" + type.tag || "")
    }
    return cmptValue || type?.tag || ""
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