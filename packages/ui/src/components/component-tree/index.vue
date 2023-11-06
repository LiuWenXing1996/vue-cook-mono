<template>
    <div class="component-tree">
        <div class="actions">
            <n-input v-model:value="searchKey" placeholder="搜索" size="small" round clearable>
                <template #prefix>
                    <n-icon>
                        <component-search-icon />
                    </n-icon>
                </template>
            </n-input>
            <n-icon @click="addPage">
                <component-add-icon></component-add-icon>
            </n-icon>
        </div>
        <n-tree :data="treeData" expand-on-click block-line :selected-keys="selectedKeysRef"
            @update:selected-keys="nodeClick" :pattern="searchKey"></n-tree>
    </div>
</template>
<script setup lang="ts">
import { computed, h, ref, type VNodeChild, } from "vue";
import { NTree, NIcon, NInput, NPopover, NSpace, type TreeOption } from "naive-ui"
import ComponentAddIcon from "@/icons/component-add.svg?component"
import ComponentSearchIcon from "@/icons/component-search.svg?component"
import { useInjectSudioState } from "@/hooks/useInjectStudioState";
import ComponentEditor from "@/components/component-editor/index.vue"
import { listToTree, type IItem } from "../file-tree/utils";
const searchKey = ref("")
const componentFileSuffix = ".cook-component.json"

const addPage = () => { }
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

const treeData = computed(() => {
    const treeFlattedData: Record<string, IItem<string> & {
        key: string,
    }> = {}
    const componentFileList = modulesRef.value.filter(e => e.endsWith(componentFileSuffix))
    componentFileList.forEach(key => {
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
        panelList.value.push({
            uid: willEditKey,
            title: `${willEditKey}`,
            content: () => h(ComponentEditor, { filePath: willEditKey })
        })
    }
    currentPanelId.value = willEditKey
}

</script>
<style lang="less" scoped>
.component-tree {
    height: 100%;

    .actions {
        display: flex;
        padding: 10px;
        align-items: center;

        :deep(.n-icon) {
            margin-left: 10px;
        }
    }
}
</style>