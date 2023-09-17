<script setup lang="ts">
import { NTree, NIcon } from "naive-ui"
import { h, ref, toRefs, type VNodeChild, inject } from 'vue';
import { Folder } from '@vicons/ionicons5'
import { listToTree, type IItem } from "../utils/listToTree"
import type { IStudioState } from "../types";

const studioState = inject<IStudioState>('studioState') as IStudioState

const { fs, volume } = studioState
const modules = ref<Record<string, any>>(volume.toJSON())


fs.watch("/", {}, () => {
    console.log("fs-change:")
    debugger
    modules.value = volume.toJSON()
})

const selectedKeys = ref<string[]>([])

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

const treeFlattedData: Record<string, IItem<string> & {
    key: string,
    prefix: () => VNodeChild
}> = {}
Object.keys(modules.value).forEach(key => {
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

const data = ref(treeData)
</script>

<template>
    <n-tree block-line expand-on-click :data="data" :selected-keys="selectedKeys" @update:selected-keys="(keys: string[]) => {
        selectedKeys = keys
        const willEditKey = selectedKeys[0]
        const file = studioState.currentEditFiles.files.find(e => e === willEditKey)
        if (isDir(willEditKey)) {
            return
        }
        if (!file) {
            studioState.currentEditFiles = {
                ...studioState.currentEditFiles,
                files: [...studioState.currentEditFiles.files, willEditKey]
            }
        }
        studioState.currentEditFiles = {
            ...studioState.currentEditFiles,
            activeFilePath: willEditKey
        }
    }" />
</template>