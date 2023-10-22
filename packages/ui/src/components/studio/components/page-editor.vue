<template>
    <div class="page-editor">
        <n-tabs type="segment" :style="{ height: '100%', display: 'flex', flexDirection: ' column' }"
            :pane-style="{ flexGrow: 1, padding: 0, overflow: 'hidden' }">
            <n-tab-pane name="sourceCode" tab="源码" display-directive="show">
                <file-editor :name="filePath"></file-editor>
            </n-tab-pane>
            <n-tab-pane name="designView" tab="设计视图" display-directive="show">
                <design-view :path="filePath"></design-view>
            </n-tab-pane>
        </n-tabs>
    </div>
</template>
<script setup lang="ts">
import { NTabs, NTabPane } from "naive-ui"
import FileEditor from "./file-editor.vue"
import DesignView from "./design-view.vue"
import { computed, inject, toRefs, watch } from "vue";
import type { IStudioState } from "../types";
import { toRenameRefs } from "@/utils/toRenameRefs";
const studioState = inject<IStudioState>('studioState') as IStudioState
const { schemaDataRef } = toRenameRefs(studioState)
const props = defineProps<{ filePath: string }>()

watch(() => studioState.currentPanelId, () => {
    console.log(studioState)
})

watch(schemaDataRef, (newVale) => {
    console.log(newVale)
})

const { filePath } = toRefs(props)

</script>
<style lang="less" scoped>
.page-editor {
    height: 100%;
}
</style>