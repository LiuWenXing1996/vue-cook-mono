<template>
    <div class="material-item" :draggable="true" @dragstart="handleDragStart" :data-name="material.name"
        :data-package="material.group">
        <div class="icon-wrapper">
            <n-icon size="25" :depth="3">
                <component-item-icon></component-item-icon>
            </n-icon>
        </div>
        <div class="material-detail">
            <div class="material-name">{{ material.name }}</div>
            <div class="material-packageName">{{ material.packageName }}</div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { computed, inject, toRefs } from "vue"
import { NIcon } from 'naive-ui'
import ComponentItemIcon from "@/icons/component-item.svg?component"
import { type IMaterial, type IDep } from "@vue-cook/core"
const props = defineProps<{
    material: IMaterial,
    dep: IDep
}>()

const { material } = toRefs(props)

const handleDragStart = (e: DragEvent) => {
    if (!(e.target instanceof HTMLDivElement)) {
        return;
    }
    e?.dataTransfer?.setData('name', material.value.name)
    e?.dataTransfer?.setData('package', material.value.packageName)
}

</script>
<style lang="less" scoped>
.material-item {
    display: flex;
    border: #efeff5 1px solid;
    border-radius: 2px;
    padding: 5px;

    &:hover {
        border-color: #18a058;
        cursor: move;
    }

    &.panel:hover {
        cursor: pointer;
    }


    .material-detail {
        display: flex;
        margin-left: 10px;
        flex-grow: 1;
        flex-direction: column;

        .material-packageName {
            color: #a0a0a0;
        }
    }
}
</style>