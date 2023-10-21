<template>
    <n-layout has-sider>
        <n-layout-sider bordered :width="64">
            <n-menu :options="menuOptions" :collapsed="true" :collapsed-width="64" :collapsed-icon-size="22"
                v-model:value="selectedKey" />
        </n-layout-sider>

        <n-layout>
            <div class="left-content">
                <keep-alive>
                    <!-- TODO:使用数组渲染，不然iframe 会重复刷新 -->
                    <component :is="selectedContent"></component>
                </keep-alive>
            </div>
        </n-layout>
    </n-layout>
</template>
<script setup lang="ts">
import { toRefs, provide, ref, h, computed } from 'vue';
import type { Component } from "vue"
import { NLayout, NLayoutSider, NMenu, NIcon } from "naive-ui"
import type { MenuOption } from "naive-ui"
import FileTree from "./file-tree.vue"
import RunPane from "./run-pane.vue"
import MaterialPane from "./material-pane.vue"
import {
    DocumentsOutline,
    SearchOutline,
    PlayOutline,
    GridOutline
} from '@vicons/ionicons5'

const selectedKey = ref('resource-manager')
const selectedContent = computed(() => {
    const content = menuOptions.find(e => e.key === selectedKey.value)?.content
    return content
})

const renderIcon = (icon: Component) => {
    return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions: (MenuOption & {
    content: Component
})[] = [
        {
            label: '资源管理器',
            key: 'resource-manager',
            icon: renderIcon(DocumentsOutline),
            content: FileTree
        },
        {
            label: '物料',
            key: 'material',
            icon: renderIcon(GridOutline),
            content: MaterialPane
        },
        {
            label: '搜索',
            key: 'search',
            icon: renderIcon(SearchOutline),
            content: () => h('div', "搜索")
        },
        {
            label: '运行',
            key: 'run',
            icon: renderIcon(PlayOutline),
            content: RunPane
        }
    ]
</script>
<style lang="less">
.left-content {
    height: 100%;
    padding: 10px;
    box-sizing: border-box;
}
</style>
