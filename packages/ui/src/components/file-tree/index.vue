<script setup lang="ts">
import { NTree, NIcon, type TreeOption } from "naive-ui"
import { h, ref, type VNodeChild, computed } from 'vue';
import { Folder } from '@vicons/ionicons5'
import { path } from "@vue-cook/core"
import { listToTree, type IItem } from "./utils"
import FileEditor from "@/components/file-editor/index.vue"
import ComponentEditor from "@/components/component-editor/index.vue"
import { useInjectSudioState } from "@/hooks/useInjectStudioState";

const { panelList, currentPanelId, vfs } = useInjectSudioState()
const fs = vfs.value.getFs()
const modulesRef = ref<string[]>([])

vfs.value.listFiles().then(res => {
    modulesRef.value = res
})
fs.watch("/", {}, () => {
    vfs.value.listFiles().then(res => {
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
    return treeData as unknown as TreeOption[]
})

const nodeClick = (keys: string[]) => {
    selectedKeysRef.value = keys
    const willEditKey = selectedKeysRef.value[0]
    if (isDir(willEditKey)) {
        return
    }
    const filePanel = panelList.value.find(e => e.uid === willEditKey)
    if (!filePanel) {
        console.log("willEditKey", willEditKey)
        let PanelComponent = () => h(FileEditor, { name: willEditKey })
        const fileName = path.basename(willEditKey)
        // TODO:抽象出来
        if (fileName === "page.config.yaml") {
            PanelComponent = () => h(ComponentEditor, { filePath: willEditKey })
        }
        // if (buildContext.findSchemaParser(willEditKey)) {
        //     PanelComponent = () => h(PageEditor, { filePath: willEditKey })
        // }
        panelList.value.push({
            uid: willEditKey,
            title: willEditKey,
            content: PanelComponent
        })
    }
    currentPanelId.value = willEditKey
}

</script>

<template>
    <n-tree block-line expand-on-click :data="data" :selected-keys="selectedKeysRef" @update:selected-keys="nodeClick" />
</template>