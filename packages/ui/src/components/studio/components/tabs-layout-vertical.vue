<template>
    <split-panes>
        <split-pane v-for="l in list" class="left-pane" min-size="15" size="20">
            <tab-container v-if="l.type === 'TabContainer'" v-bind="l.content"></tab-container>
            <tabs-layout-horizontal v-if="l.type === 'TabsLayoutHorizontal'" v-bind="l.content"></tabs-layout-horizontal>
        </split-pane>
    </split-panes>
</template>
<script setup lang="ts">
import { Splitpanes as SplitPanes, Pane as SplitPane } from 'splitpanes'
import { type ITabContaienrProps } from './tab-container.vue';
import TabContainer from './tab-container.vue';
import { type ITabsLayoutHorizontalProps } from './tabs-layout-horizontal.vue';
import TabsLayoutHorizontal from './tabs-layout-horizontal.vue';

export interface ITabsLayoutVerticalProps {
    list: Array<
        {
            type: "TabContainer",
            content: ITabContaienrProps
        } |
        {
            type: "TabsLayoutHorizontal",
            content: ITabsLayoutHorizontalProps
        }
    >
}
defineProps<ITabsLayoutVerticalProps>()
</script>
<style lang="less" scoped></style>