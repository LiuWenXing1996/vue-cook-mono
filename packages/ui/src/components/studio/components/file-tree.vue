<script setup lang="ts">
import { NTree, NIcon } from "naive-ui"
import { h, ref, toRefs, type VNodeChild, inject, computed } from 'vue';
import { Folder } from '@vicons/ionicons5'
import { createFsUtils, path } from "@vue-cook/core"
import { listToTree, type IItem } from "../utils/listToTree"
import type { IStudioState } from "../types";
import FileEditor from "./file-editor.vue"
import PageEditor from "./page-editor.vue"
import { useInjectSudioState } from "@/hooks/useInjectStudioState";

const { panelListRef, currentPanelIdRef, vfsRef } = useInjectSudioState()
const vfs = vfsRef.value
const fs = vfs.getFs()
const modulesRef = ref<string[]>([])

vfs.listFiles().then(res => {
    modulesRef.value = res
})
fs.watch("/", {}, () => {
    vfs.listFiles().then(res => {
        modulesRef.value = res
    })
})
const selectedKeysRef = ref<string[]>([])
const getAllPaths = (filePath: string) => {
    const allPathPoints = filePath.split('/');
    let allPaths: string[] = []
    allPathPoints.map((_key, index) => {
        allPaths[index] = allPathPoints.slice(0, index + 1).join("/")
    })
    return allPaths
}
const isDir = (path: string) => {
    if (!fs.existsSync(path)) {
        return false
    }
    const isFile = fs.lstatSync(path).isFile()
    if (!isFile) {
        return true
    }
    return false
}

const data = computed(() => {
    const treeFlattedData: Record<string, IItem<string> & {
        key: string,
        prefix: () => VNodeChild
    }> = {}
    modulesRef.value.forEach(key => {
        const allPaths = getAllPaths(key)
        const length = allPaths.length
        allPaths.map((e, i) => {
            const allPathPoints = e.split('/');
            treeFlattedData[e] = {
                id: e,
                key: e,
                parentId: allPaths[i - 1],
                isLeaf: i === length - 1,
                isRoot: i === 0,
                label: allPathPoints[allPathPoints.length - 1],
                value: e,
                prefix: () => {
                    if (isDir(e)) {
                        return h(NIcon, null, {
                            default: () => h(Folder)
                        })
                    }
                }

            }
        })
    })
    const list = Object.keys(treeFlattedData).map(e => treeFlattedData[e])
    const treeData = listToTree(list)
    return treeData
})

const nodeClick = (keys: string[]) => {
    selectedKeysRef.value = keys
    const willEditKey = selectedKeysRef.value[0]
    if (isDir(willEditKey)) {
        return
    }
    const filePanel = panelListRef.value.find(e => e.uid === willEditKey)
    if (!filePanel) {
        console.log("willEditKey", willEditKey)
        let PanelComponent = () => h(FileEditor, { name: willEditKey })
        const fileName = path.basename(willEditKey)
        if (fileName === "page.config.yaml") {
            PanelComponent = () => h(PageEditor, { filePath: willEditKey })
        }
        // if (buildContext.findSchemaParser(willEditKey)) {
        //     PanelComponent = () => h(PageEditor, { filePath: willEditKey })
        // }
        panelListRef.value.push({
            uid: willEditKey,
            title: willEditKey,
            content: PanelComponent
        })
    }
    currentPanelIdRef.value = willEditKey
}

</script>

<template>
    <n-tree block-line expand-on-click :data="data" :selected-keys="selectedKeysRef" @update:selected-keys="nodeClick" />
</template>