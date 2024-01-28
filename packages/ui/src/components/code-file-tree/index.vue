<script setup lang="ts">
import { NTree, NIcon, NButton, type TreeOption } from "naive-ui"
import { h, ref, type VNodeChild, computed, shallowRef, watch } from 'vue';
import { Folder } from '@vicons/ionicons5'
import { path } from "@vue-cook/core"
import { listToTree, type IItem } from "./utils"
import FileEditor from "@/components/file-editor/index.vue"
import ComponentEditor from "@/components/component-editor/index.vue"
import { useInjectSudioState } from "@/hooks/useInjectStudioState";
import { createVfs, build, transform } from '@vue-cook/schema-bundler'
import FileSystemTree from "@/components/file-system-tree/index.vue"
import { isDir } from "../file-system-tree/utils";

const { panelList, currentPanelId, vfs, services } = useInjectSudioState()
const currenrtVfs = shallowRef(createVfs())

const selectedKeys = ref<string[]>([])

watch(selectedKeys, async (keys) => {
    const willEditKey = keys[0]
    if (isDir(currenrtVfs.value, willEditKey)) {
        return
    }
    const filePanel = panelList.value.find(e => e.uid === willEditKey)
    if (!filePanel) {
        console.log("willEditKey", willEditKey)
        let PanelComponent = () => h(FileEditor, { fileName: willEditKey, vfs: currenrtVfs.value })
        panelList.value.push({
            uid: willEditKey,
            title: willEditKey,
            content: PanelComponent
        })
    }
    currentPanelId.value = willEditKey
    return
})

const toCode = async () => {
    const a = await transform({ vfs: vfs.value })
    currenrtVfs.value = a
}

</script>

<template>
    <n-button @click="toCode">出码</n-button>
    <FileSystemTree :vfs="currenrtVfs" :selected-keys="selectedKeys" @change-selected-keys="(keys) => {
        selectedKeys = keys
    }" />
</template>