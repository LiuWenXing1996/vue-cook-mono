<template>
    <split-panes>
        <split-pane v-for="l in list" class="left-pane" min-size="15" size="20">
            <tab-container v-if="l.type === 'TabContainer'" v-bind="l.content"></tab-container>
            <tabs-layout-vertical v-if="l.type === 'TabsLayoutVertical'" v-bind="l.content"></tabs-layout-vertical>
        </split-pane>
    </split-panes>
</template>
<script setup lang="ts">
import { Splitpanes as SplitPanes, Pane as SplitPane } from 'splitpanes'
import type { ITabContaienrProps } from './tab-container.vue';
import TabContainer from './tab-container.vue';
import type { ITabsLayoutVerticalProps } from './tabs-layout-vertical.vue';
import TabsLayoutVertical from './tabs-layout-vertical.vue';

export interface ITabsLayoutHorizontalProps {
    list: Array<
        {
            type: "TabContainer",
            content: ITabContaienrProps
        } |
        {
            type: "TabsLayoutVertical",
            content: ITabsLayoutVerticalProps
        }
    >
}
defineProps<ITabsLayoutHorizontalProps>()
</script>
<style lang="less" scoped></style>