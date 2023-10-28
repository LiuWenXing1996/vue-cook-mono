<template>
    <div class="design-view">
        <div class="actions">
            <n-space align="center">
                <n-popover trigger="hover" placement="bottom">
                    <template #trigger>
                        <n-icon @click="undo()">
                            <arrow-undo-outline></arrow-undo-outline>
                        </n-icon>
                    </template>
                    撤销
                </n-popover>
                <n-popover trigger="hover" placement="bottom">
                    <template #trigger>
                        <n-icon @click="redo()">
                            <arrow-redo-outline></arrow-redo-outline>
                        </n-icon>
                    </template>
                    恢复
                </n-popover>
                <n-popover trigger="hover" placement="bottom">
                    <template #trigger>
                        <n-icon>
                            <document-outline></document-outline>
                        </n-icon>
                    </template>
                    <n-space vertical>
                        <n-space align="center" justify="space-around" style="width: 200px;">
                            <label>宽度：</label>
                            <div style="width: 130px;">
                                <n-input-number v-model:value="size.width" size="small">
                                    <template #suffix>px</template>
                                </n-input-number>
                            </div>
                        </n-space>
                        <n-space align="center" justify="space-around" style="width: 200px;">
                            <label>高度：</label>
                            <div style="width: 130px;">
                                <n-input-number v-model:value="size.height" size="small">
                                    <template #suffix>px</template>
                                </n-input-number>
                            </div>
                        </n-space>
                        <n-space align="center" justify="space-around" style="width: 200px;">
                            <label>比例：</label>
                            <div style="width: 130px;">
                                <n-input-number v-model:value="size.scale" size="small">
                                    <template #suffix>%</template>
                                </n-input-number>
                            </div>
                        </n-space>
                    </n-space>
                </n-popover>
            </n-space>
        </div>
        <div class="component-cook-contaienr">
            <ruler-box :size="size">
                <div class="component-cook-content">
                    <iframe ref="iframeRef"></iframe>
                    <component-picker :iframe-ref="iframeRef" :enable-picker="true" :size="size"
                        :rendererContext="rendererContextRef"></component-picker>
                </div>
            </ruler-box>
        </div>

    </div>
</template>
<script setup lang="ts">
import { shallowRef, ref, watch, toRefs, computed, onUnmounted } from 'vue';
import { NIcon, NPopover, NSpace, NInputNumber } from "naive-ui"
import { ArrowUndoOutline, ArrowRedoOutline, DocumentOutline } from "@vicons/ionicons5"
import { createDesignRendererContext, removeTemplatePid, type IComponentConfigWithTemplatePid, type IDesignComponentPageSize, type IDesignRendererContext } from "@vue-cook/core"
import { useInjectSudioState } from '@/hooks/useInjectStudioState';
import { useComponentSchemaList } from '@/hooks/useComponentSchemaList';
import RulerBox from "./ruler-box.vue"
import { useRefHistory } from '@vueuse/core'
import ComponentPicker from "./component-picker.vue"
import FileEditor from "@/components/file-editor/index.vue"

const { services, projectName, vfs } = useInjectSudioState()
const componentSchemaList = useComponentSchemaList({ vfs: vfs.value, componentSchemaFileNames: ["page.config.yaml"] })

const props = defineProps<{
    path: string
}>()
const { path } = toRefs(props)
const size = ref<IDesignComponentPageSize>({
    width: 1920,
    height: 1080,
    scale: 100
})
const iframeRef = ref<HTMLIFrameElement>()
const rendererContextRef = shallowRef<IDesignRendererContext>()
const toPx = (n: number) => `${n}px`
const widthPx = computed(() => toPx(size.value.width * size.value.scale / 100))
const heightPx = computed(() => toPx(size.value.height * size.value.scale / 100))
const iframeWidthPx = computed(() => toPx(size.value.width))
const iframeHeightPx = computed(() => toPx(size.value.height))
const scaleString = computed(() => {
    return `scale(${size.value.scale / 100})`
})

const editingSchemaString = ref<string>("")
const { undo, redo, dispose } = useRefHistory(editingSchemaString, {
    deep: true
})
onUnmounted(() => {
    dispose()
})

watch(iframeRef, async () => {
    if (iframeRef?.value?.contentWindow) {
        const depsEntry = await services.value.getDesignDepsEntry({
            projectName: projectName.value
        })
        const conext = await createDesignRendererContext({
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
<style lang="less" scoped>
.design-view {
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;

    .actions {
        padding: 3px;
        width: 100%;

        .n-icon:hover {
            cursor: pointer;
            color: rgb(24, 160, 88);
        }

        .n-icon.actived {
            color: rgb(24, 160, 88);
        }
    }

    .component-cook-contaienr {
        flex-grow: 1;
        overflow: hidden;
        position: relative;

        .component-cook-content {
            position: relative;
            width: v-bind(widthPx);
            height: v-bind(heightPx);

            iframe {
                border: none;
                position: absolute;
                width: v-bind(iframeWidthPx);
                height: v-bind(iframeHeightPx);
                left: 0;
                top: 0;
                z-index: 2;
                transform: v-bind(scaleString);
                transform-origin: top left;
            }
        }
    }


}
</style>