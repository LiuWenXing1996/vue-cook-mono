<template>
    <template v-if="config.text">
        {{ config.text }}
    </template>
    <template v-else-if="cmpt">
        <component :is="cmpt" v-bind="attributes" v-on="emits">
            <template v-for="(slot, name) in config?.slots" v-slot:[name]>
                <template-render :config="_config" v-for="_config in slot" :dev="dev" :view-map="viewMap"
                    :editor-map="editorMap" :render-mode="renderMode"></template-render>
            </template>
        </component>
    </template>
</template>
<script setup lang="ts">
import { getCurrentInstance, toRefs, onMounted, computed, inject, onUpdated, type Component } from "vue";
import { type ITemplateConfig, type IView, getComponentTypeUniName, type IEditor, getEditorTypeUniName, type IRenderMode } from "@vue-cook/core"
const props = defineProps<{
    config: ITemplateConfig,
    viewMap: Map<string, IView<Component>>,
    editorMap: Map<string, IEditor>,
    dev: boolean,
    renderMode: IRenderMode
}>()
const { config, dev, viewMap, editorMap, renderMode } = toRefs(props)

const attributes = computed(() => {
    const attributesConfig = config.value.attributes || {}
    let res: Record<string, any> = {}
    Object.keys(attributesConfig).map(key => {
        const config = attributesConfig[key]
        const editorUName = getEditorTypeUniName(config.editorType)
        const editor = editorMap.value.get(editorUName)
        if (editor) {
            res[key] = editor.transfer(config.value)
        }
    })
    return res
})

const cmpt = computed(() => {
    if (config.value.text) {
        return ""
    }
    if (!config.value.type) {
        return ""
    }
    const { type } = config.value
    const cmptUName = getComponentTypeUniName(type)
    const view = viewMap.value.get(cmptUName)?.makeComponent?.(renderMode.value)
    return view || type.name || ""
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