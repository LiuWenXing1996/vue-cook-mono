<template>
    <div class="component-editor">
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
        <div class="design-view-wrapper">
            <!-- <design-view :path="filePath"></design-view> -->
        </div>
    </div>
</template>
<script setup lang="ts">
// import DesignView from "./components/design-view.vue"
import { NIcon, NPopover, NSpace } from "naive-ui"
import { ArrowUndoOutline, ArrowRedoOutline, DocumentOutline } from "@vicons/ionicons5"

defineProps<{ filePath: string }>()
</script>
<style lang="less">
.component-editor {
    height: 100%;
    display: flex;
    flex-direction: column;

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

    .design-view-wrapper {
        flex: 1;
        display: flex;
        flex-direction: row;
    }
}
</style>