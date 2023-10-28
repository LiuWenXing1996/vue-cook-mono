<template>
    <div class="design-view">
        <iframe ref="iframeRef"></iframe>
    </div>
</template>
<script setup lang="ts">
import { shallowRef, ref, watch, onMounted } from 'vue';
import type * as Vue from "vue";
import { emitEditorWindowSchemaChange, type ISchemaData, type IRenderContext, SchemaChanegeDataType, createRenderContext, type IComponentSchemaConfig, createDesignRenderContext, type IDesignRenderContext } from "@vue-cook/core"
import { toRenameRefs } from '@/utils/toRenameRefs';
import { useInjectSudioState } from '@/hooks/useInjectStudioState';
import { useComponentSchemaList } from '@/hooks/useComponentSchemaList';

const { servicesRef, projectNameRef, vfsRef } = useInjectSudioState()
const services = servicesRef.value
const projectName = projectNameRef.value
const vfs = vfsRef.value
const fs = vfs.getFs()
const componentSchemaList = useComponentSchemaList({ vfs, componentSchemaFileNames: ["page.config.yaml"] })

const props = defineProps({
    path: {
        type: String,
        required: true
    }
})
const { pathRef } = toRenameRefs(props)
const iframeRef = ref<HTMLIFrameElement>()
const renderContextRef = shallowRef<IDesignRenderContext>()
watch(iframeRef, async () => {
    if (iframeRef?.value?.contentWindow) {
        const depsEntry = await services.getDesignDepsEntry({
            projectName
        })
        const conext = await createDesignRenderContext({
            depsEntry: depsEntry,
            iframeEl: iframeRef.value,
            schemaData: {
                mainPath: pathRef.value,
                componentList: componentSchemaList.value
            },
            renderConfig: {
                packageName: '@vue-cook/render',
                renderVarName: 'default'
            },
        })
        renderContextRef.value = conext
    }
})
watch([pathRef, componentSchemaList], ([path, componentSchemaList]) => {
    if (renderContextRef.value) {
        renderContextRef.value.updateSchemaData({
            mainPath: path,
            componentList: componentSchemaList
        })
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