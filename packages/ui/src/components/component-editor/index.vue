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
                <n-divider vertical />
                <n-popover trigger="hover" placement="bottom">
                    <template #trigger>
                        <n-icon>
                            <code-and-design-view-split-icon></code-and-design-view-split-icon>
                        </n-icon>
                    </template>
                    平分视图
                </n-popover>
                <n-popover trigger="hover" placement="bottom">
                    <template #trigger>
                        <n-icon>
                            <code-view-icon></code-view-icon>
                        </n-icon>
                    </template>
                    代码视图
                </n-popover>
                <n-popover trigger="hover" placement="bottom">
                    <template #trigger>
                        <n-icon>
                            <design-view-icon></design-view-icon>
                        </n-icon>
                    </template>
                    设计视图
                </n-popover>
                <n-divider vertical />
            </n-space>
        </div>
        <div class="view-content">
            <div class="code-view-wrapper">
                <file-editor :name="filePath"></file-editor>
            </div>
            <div class="design-view-wrapper">
                <design-view :path="filePath"></design-view>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { NDivider } from "naive-ui"
import FileEditor from "@/components/file-editor/index.vue"
import DesignView from "./components/design-view.vue"
import CodeAndDesignViewSplitIcon from "@/icons/code-and-design-view-split.svg?component"
import CodeViewIcon from "@/icons/code-view.svg?component"
import DesignViewIcon from "@/icons/design-view.svg?component"
import { NIcon, NPopover, NSpace, NInputNumber } from "naive-ui"
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

    .view-content {
        flex: 1;
        display: flex;
        flex-direction: row;

        .code-view-wrapper,
        .design-view-wrapper {
            height: 100%;
            width: 50%;
        }

    }
}
</style>