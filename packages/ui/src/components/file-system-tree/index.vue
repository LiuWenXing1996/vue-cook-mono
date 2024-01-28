<script setup lang="ts">
import { NTree, NIcon, type TreeOption } from "naive-ui"
import { h, ref, type VNodeChild, computed, toRefs, watch } from 'vue';
import { Folder } from '@vicons/ionicons5'
import { type IVirtulFileSystem } from "@vue-cook/core"
import { listToTree, type IItem, getAllPaths, isDir } from "./utils"
import type { FSWatcher } from "node:fs";
import useControlledState from "@/hooks/useControlledState";
const props = defineProps<{
    vfs: IVirtulFileSystem,
    selectedKeys?: string[]
}>()

const emits = defineEmits<{
    (e: 'changeSelectedKeys', keys: string[]): void
}>()

const { vfs } = toRefs(props)
const { state: selectedKeys, set: setSelectedKeys } = useControlledState({
    key: "selectedKeys",
    props,
    emit: (value) => {
        emits("changeSelectedKeys", value || [])
    }
})
const currentFsWatcher = ref<FSWatcher>()
const filePathList = ref<string[]>([])
const treeData = computed(() => {
    const treeFlattedData: Record<string, IItem<string> & {
        key: string,
        prefix: () => VNodeChild
    }> = {}
    filePathList.value.forEach(key => {
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
                    if (isDir(vfs.value, e)) {
                        return h(NIcon, null, {
                            default: () => h(Folder)
                        })
                    }
                }

            }
        })
    })
    const list = Object.keys(treeFlattedData).map(e => treeFlattedData[e])
    const treeOptionList = listToTree(list)
    return treeOptionList as unknown as TreeOption[]
})

watch(vfs, () => {
    currentFsWatcher.value?.close()
    vfs.value.listFiles().then(res => {
        filePathList.value = res
    })
    const fs = vfs.value.getFs()
    currentFsWatcher.value = fs.watch("/", {}, () => {
        vfs.value.listFiles().then(res => {
            filePathList.value = res
        })
    })
}, {
    immediate: true
})


</script>

<template>
    <n-tree block-line expand-on-click :data="treeData" :selected-keys="selectedKeys" @update:selected-keys="(keys) => {
        setSelectedKeys([...keys])
    }" />
</template>