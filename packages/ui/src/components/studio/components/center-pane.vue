
<script setup lang="ts">
import { NTabs, NTabPane, NEmpty } from "naive-ui";
import { inject, ref, toRefs, watch, computed, type VNodeChild, h } from "vue";
import type { IPanelConfig, IStudioState } from "../types";
import { computedAsync } from '@vueuse/core'
import FileEditor from "./file-editor.vue"

const studioState = inject<IStudioState>('studioState') as IStudioState
const { vfs } = studioState
const { currentEditFiles } = toRefs(studioState)

const files = computed(() => currentEditFiles?.value?.files || [])
const panelList = computedAsync(async () => {
    console.log(files)

    return await Promise.all(files.value.map(async f => {
        const value = await vfs.readFile(f, { encoding: "utf-8" })
        const panelConfig: IPanelConfig = {
            uid: f,
            title: f,
            content: () => h(FileEditor, {
                value: value,
                name: f
            })
        }
        return panelConfig
    }))
})

const currentUid = ref<string>()
watch(files, () => {
    if (files.value.length > 0) {
        if (!currentUid.value) {
            currentUid.value = files.value[0]
        } else {
            const length = files.value.length
            currentUid.value = files.value[length - 1]
        }
    } else {
        currentUid.value = undefined
    }
}, {
    deep: true,
    immediate: true
})

const handleClose = (name: string) => {
    if (studioState.currentEditFiles) {
        const panelConfig = files.value.find(e => e === name)
        if (panelConfig) {
            studioState.currentEditFiles = {
                ...studioState.currentEditFiles,
                files: studioState.currentEditFiles.files.filter(e => e !== name)
            }
        }
    }
}

</script>
<template>
    <div class="panel-list">
        <template v-if="files.length <= 0">
            <div class="title">
                <div>无面板</div>
            </div>
            <div class="content">
                <n-empty description="没有打开的面板"></n-empty>
            </div>
        </template>
        <template v-else>
            <n-tabs size="small" type="card" v-model:value="currentUid" closable @close="handleClose"
                :style="{ height: '100%', display: 'flex', flexDirection: ' column' }"
                :pane-style="{ flexGrow: 1, padding: 0, overflow: 'hidden' }">
                <n-tab-pane :name="l.uid" v-for="l in panelList" display-directive="show">
                    <template #tab>
                        <div>{{ l.title }}</div>
                    </template>
                    <keep-alive>
                        <component :is="l.content()"></component>
                    </keep-alive>
                </n-tab-pane>
            </n-tabs>
        </template>
    </div>
</template>
<style lang="less" scoped>
.panel-list {
    height: 100%;
    display: flex;
    flex-direction: column;

    .title {
        display: flex;
        align-items: center;
        justify-content: left;
        font-size: 14px;
        padding: 6px 10px;
        justify-content: space-between;
        border-bottom: 1px solid rgb(239, 239, 245);
    }

    .content {
        flex-grow: 1;
        padding: 10px;
    }
}
</style>