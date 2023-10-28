<template>
    <n-popover trigger="manual" :show="showPopover" placement="left">
        <template #trigger>
            <div class="component-overlay" @click="handleClick(overlay, $event)"></div>
        </template>
        <component-overlay-tips :size="size" :overlay="overlay"></component-overlay-tips>
        <!-- TODO：添加插槽拖拽功能 -->
    </n-popover>
</template>
<script setup lang="ts">
import { computed, nextTick, ref, toRefs, watch } from "vue";
import { NPopover } from "naive-ui"
import ComponentOverlayTips from "./component-overlay-tips.vue"
import type { IDesignComponentOverlay, IDesignComponentPageSize } from "@vue-cook/core";

const props = defineProps<{
    overlay: IDesignComponentOverlay,
    size: IDesignComponentPageSize,
}>()

const { overlay, size } = toRefs(props)
const toPx = (n: number) => `${n}px`
const width = computed(() => toPx(overlay.value.rect.width * size.value.scale / 100))
const height = computed(() => toPx(overlay.value.rect.height * size.value.scale / 100))
const left = computed(() => toPx(overlay.value.rect.left * size.value.scale / 100))
const top = computed(() => toPx(overlay.value.rect.top * size.value.scale / 100))
const showPopover = ref(true)
watch(overlay, (newValue, oldValue) => {
    if (newValue !== oldValue) {
        showPopover.value = false;
        nextTick(() => {
            showPopover.value = true;
        })
    }
})
const handleClick = (overlay: IDesignComponentOverlay, event: MouseEvent) => {
    event.stopPropagation()
    console.log("component-overlay click")
}

</script>
<style lang="less" scoped>
.component-overlay {
    position: absolute;
    z-index: 3;
    width: v-bind(width);
    height: v-bind(height);
    left: v-bind(left);
    top: v-bind(top);
    border: solid 1px;
    border-color: #18a058;
    border-radius: 3px;
    background-color: rgba(24, 160, 88, 0.3);
    display: flex;
    padding: 10px;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;

    .slot-dragger-wrapper {
        flex: 1;
        height: 100%;
        margin-right: 10px;

        &:last-child {
            margin-right: 0;
        }
    }
}
</style>
<style lang="less"></style>