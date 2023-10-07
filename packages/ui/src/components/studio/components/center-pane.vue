
<script setup lang="ts">
import { NTabs, NTabPane, NEmpty } from "naive-ui";
import { inject, toRefs } from "vue";
import type { IStudioState } from "../types";

const studioState = inject<IStudioState>('studioState') as IStudioState
const { panelList, currentPanelId } = toRefs(studioState)

const handleClose = (uid: string) => {
    if (currentPanelId.value === uid) {
        const lastPanel = panelList.value[panelList.value.length - 1]
        currentPanelId.value = lastPanel?.uid
    }
    panelList.value = panelList.value.filter(e => e.uid !== uid)
}

</script>
<template>
    <div class="panel-list">
        <template v-if="panelList.length <= 0">
            <div class="title">
                <div>无面板</div>
            </div>
            <div class="content">
                <n-empty description="没有打开的面板"></n-empty>
            </div>
        </template>
        <template v-else>
            <n-tabs size="small" type="card" v-model:value="currentPanelId" closable @close="handleClose"
                :style="{ height: '100%', display: 'flex', flexDirection: ' column' }"
                :pane-style="{ flexGrow: 1, padding: 0, overflow: 'hidden' }">
                <n-tab-pane :name="l.uid" v-for="l in panelList" display-directive="show">
                    <template #tab>
                        <div>{{ l.title }}</div>
                    </template>
                    <component :is="l.content()"></component>
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