<template>
    <div class="design-view">
        <split-pane-container>
            <split-pane min-size="15" size="70">
                <div class="component-cook-contaienr">
                    <div class="component-cook-content">
                        <iframe ref="designRendererIframeRef"></iframe>
                        <component-picker :iframe-ref="designRendererIframeRef" :enable-picker="true" :size="size"
                            :rendererContext="rendererContextRef"></component-picker>
                    </div>
                </div>
            </split-pane>
            <split-pane min-size="15" size="30">
                <div class="component-editor-container">
                    <iframe class="component-editor-container-iframe" ref="editorRendererIframeRef"></iframe>
                </div>
            </split-pane>
        </split-pane-container>
    </div>
</template>
<script setup lang="ts">
import { shallowRef, ref, watch, toRefs, computed, onUnmounted } from 'vue';
import { createDesignRenderer, type IDesignComponentPageSize, type IDesignRenderer } from "@vue-cook/core"
import { useInjectSudioState } from '@/hooks/useInjectStudioState';
import { useComponentSchemaList } from '@/hooks/useComponentSchemaList';
import { useRefHistory } from '@vueuse/core'
import ComponentPicker from "./component-picker.vue"
import SplitPaneContainer from "@/components/splitpanes/split-pane-container.vue"
import SplitPane from "@/components/splitpanes/split-pane.vue"

const { services, projectName, vfs, cookConfig, lowcodeBundleData } = useInjectSudioState()
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
const designRendererIframeRef = ref<HTMLIFrameElement>()
const editorRendererIframeRef = ref<HTMLIFrameElement>()
const rendererContextRef = shallowRef<IDesignRenderer>()
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

watch(designRendererIframeRef, async () => {
    if (designRendererIframeRef?.value?.contentWindow) {
        const depsEntry = await services.value.getDesignDepsEntry({
            projectName: projectName.value
        })
        const conext = await createDesignRenderer({
            depsEntry: depsEntry,
            iframeEl: designRendererIframeRef.value,
            cookConfig: cookConfig.value,
            mainViewFilePath: path.value,
        })
        conext.setLowcodeBundleData(lowcodeBundleData.value)
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
                template: editingSchema?.template ? editingSchema?.template : undefined
            }
        } catch (error) { }
        await vfs.value.writeFile(path.value, JSON.stringify(editingSchema), "utf-8")
    }
})
watch(lowcodeBundleData, (lowcodeBundleDataValue) => {
    rendererContextRef.value?.setLowcodeBundleData(lowcodeBundleDataValue)
})
</script>
<style lang="less" scoped>
.design-view {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: row;

    .component-cook-contaienr {
        flex-grow: 1;
        width: 60%;

        .component-cook-content {
            position: relative;

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

    .component-editor-container {
        flex-grow: 1;
        width: 40%;

        .component-editor-container-iframe {
            border: none;
            width: 100%;
            height: 100%;
        }
    }


}
</style>