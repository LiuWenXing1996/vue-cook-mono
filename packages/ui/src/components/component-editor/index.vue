<template>
    <div class="component-editor">
        <n-tabs type="segment" :style="{ height: '100%', display: 'flex', flexDirection: ' column' }"
            :pane-style="{ flexGrow: 1, padding: 0, overflow: 'hidden' }">
            <n-tab-pane name="sourceCode" tab="源码" display-directive="show">
                <div class="actions">
                    <n-space align="center">
                        <n-popover trigger="hover" placement="bottom">
                            <template #trigger>
                                <n-icon>
                                    <arrow-undo-outline></arrow-undo-outline>
                                </n-icon>
                            </template>
                            撤销
                        </n-popover>
                        <n-popover trigger="hover" placement="bottom">
                            <template #trigger>
                                <n-icon>
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
                        </n-popover>
                    </n-space>
                </div>
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
import FileEditor from "@/components/file-editor/index.vue"
import DesignView from "./components/design-view.vue"
import { NIcon, NPopover, NSpace, NInputNumber } from "naive-ui"
import { ArrowUndoOutline, ArrowRedoOutline, DocumentOutline } from "@vicons/ionicons5"

defineProps<{ filePath: string }>()
</script>
<style lang="less">
.component-editor {
    height: 100%;

    .actions {
        padding: 3px;
        width: 100%;
        border-bottom: 1px solid rgb(239, 239, 245);

        .n-icon:hover {
            cursor: pointer;
            color: rgb(24, 160, 88);
        }

        .n-icon.actived {
            color: rgb(24, 160, 88);
        }
    }
}
</style>