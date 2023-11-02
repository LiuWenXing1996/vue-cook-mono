<template>
    <n-tabs size="small" type="card" v-model:value="currentKey" closable @close="handleClose"
        :style="{ height: '100%', display: 'flex', flexDirection: ' column' }"
        :pane-style="{ flexGrow: 1, padding: 0, overflow: 'hidden' }">
        <n-tab-pane :name="l.key" v-for="l in list" display-directive="show">
            <template #tab>
                <div>{{ l.title }}</div>
            </template>
            <component :is="l.content()"></component>
        </n-tab-pane>
    </n-tabs>
</template>
<script setup lang="ts">
import { NTabs, NTabPane, NEmpty } from "naive-ui";
import type { VNodeChild } from "vue";

export interface ITabContaienrProps {
    list: ITab[]
    currentKey: string
}
export interface ITab {
    key: string
    title: string
    content: () => VNodeChild
}

defineProps<ITabContaienrProps>()

const handleClose = (key: string) => {
    console.log("handleClose", key)
}
</script>
<style lang="less" scoped></style>