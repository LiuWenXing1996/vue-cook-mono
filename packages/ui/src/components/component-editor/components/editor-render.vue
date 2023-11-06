<template>
    <div class="editor-render">
        <iframe ref="iframeRef"></iframe>
    </div>
</template>
<script setup lang="ts">
import { shallowRef, ref, watch, toRefs, computed, onUnmounted } from 'vue';
import { createEditorRendererContext, removeTemplatePid, type IDesignComponentPageSize, type IDesignRendererContext } from "@vue-cook/core"
import { useInjectSudioState } from '@/hooks/useInjectStudioState';
import { useComponentSchemaList } from '@/hooks/useComponentSchemaList';

const { services, projectName, vfs } = useInjectSudioState()
const componentSchemaList = useComponentSchemaList({ vfs: vfs.value, componentSchemaFileNames: ["page.config.yaml"] })

const props = defineProps<{
    path: string
}>()
const { path } = toRefs(props)
const iframeRef = ref<HTMLIFrameElement>()
const rendererContextRef = shallowRef<IDesignRendererContext>()
const editingSchemaString = ref<string>("")

// TODO:实现editor Render 

watch(iframeRef, async () => {
    if (iframeRef?.value?.contentWindow) {
        const depsEntry = await services.value.getDesignDepsEntry({
            projectName: projectName.value
        })
        const conext = await createEditorRendererContext({
            depsEntry: depsEntry,
            iframeEl: iframeRef.value,
            schemaData: {
                mainPath: path.value,
                componentList: componentSchemaList.value
            },
            renderConfig: {
                packageName: '@vue-cook/render',
                renderVarName: 'default'
            },
        })
        rendererContextRef.value = conext
    }
})
watch(editingSchemaString, async (editingSchemaStringValue) => {
    const currenEditingSchemaValue = componentSchemaList.value.find(e => e.path = path.value)?.value
    if (JSON.stringify(currenEditingSchemaValue) !== editingSchemaStringValue) {
        let editingSchema = undefined;
        try {
            editingSchema = JSON.parse(editingSchemaStringValue)
            editingSchema = {
                ...editingSchema,
                template: editingSchema?.template ? removeTemplatePid(editingSchema?.template) : undefined
            }
        } catch (error) { }
        await vfs.value.writeFile(path.value, JSON.stringify(editingSchema), "utf-8")
    }
})
watch([path, componentSchemaList], ([path, componentSchemaList]) => {
    const editingSchemaValue = componentSchemaList.find(e => e.path = path)?.value
    editingSchemaString.value = JSON.stringify(editingSchemaValue)
    if (rendererContextRef.value) {
        rendererContextRef.value.updateSchemaData({
            mainPath: path,
            componentList: componentSchemaList
        })
    }
})
</script>
<style lang="less">
.editor-render {
    height: 100%;
    width: 100%;

    iframe {
        border: none;
        height: 100%;
        width: 100%;
    }
}
</style>