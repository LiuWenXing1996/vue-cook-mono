<template>
    <div class="design-view">
        <iframe ref="iframeRef"></iframe>
    </div>
</template>
<script setup lang="ts">
import { shallowRef, ref, watch, onMounted } from 'vue';
import type * as Vue from "vue";
import { emitEditorWindowSchemaChange, type ISchemaData, type IRenderContext, SchemaChanegeDataType, createRenderContext, type IComponentSchemaConfig } from "@vue-cook/core"
import { toRenameRefs } from '@/utils/toRenameRefs';
import { useInjectSudioState } from '@/hooks/useInjectStudioState';
type IVue = typeof Vue

const { servicesRef, projectNameRef, vfsRef } = useInjectSudioState()
const services = servicesRef.value
const projectName = projectNameRef.value
const vfs = vfsRef.value
const fs = vfs.getFs()

const props = defineProps({
    path: {
        type: String,
        required: true
    }
})
const { pathRef } = toRenameRefs(props)
const schemaDataJsonStringRef = ref<IComponentSchemaConfig>()
fs.watch(pathRef.value, {}, async () => {
    try {
        const content = await vfs.readYaml<IComponentSchemaConfig>(pathRef.value)
        schemaDataJsonStringRef.value = content
    } catch (error) {
        schemaDataJsonStringRef.value = undefined
    }
})
onMounted(async () => {
    try {
        const content = await vfs.readYaml<IComponentSchemaConfig>(pathRef.value)
        schemaDataJsonStringRef.value = content
    } catch (error) {
        schemaDataJsonStringRef.value = undefined
    }
})

const iframeRef = ref<HTMLIFrameElement>()
const renderContextRef = shallowRef<IRenderContext>()
watch(iframeRef, async () => {
    if (iframeRef?.value?.contentWindow) {
        const runtimeDepsEntry = await services.getRuntimeDepsEntry({
            projectName
        })
        const conext = await createRenderContext({
            depsEntry: runtimeDepsEntry,
            iframeEl: iframeRef.value,
            schemaData: schemaDataJsonStringRef.value,
            renderConfig: {
                packageName: '@vue-cook/render',
                renderVarName: 'default'
            }
        })
        renderContextRef.value = conext
    }
})
watch(schemaDataJsonStringRef, (value) => {
    if (renderContextRef.value) {
        renderContextRef.value.setSchemaData(value)
    }
})
</script>
<style lang="less">
.design-view {
    position: relative;
    width: 100%;
    height: 100%;

    iframe {
        border: none;
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 2;
    }
}
</style>