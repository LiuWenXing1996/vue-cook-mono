<template>
    <div class="component-picker" @mousemove="handleMouseMove($event)" @dragover="handleDragOver($event)"
        @mouseleave="handleMouseLeave">
        <template v-if="overlay">
            <component-overlay :overlay="overlay" :size="size"></component-overlay>
        </template>
    </div>
</template>
<script setup lang="ts">
import { computed, ref, toRefs } from "vue"
import ComponentOverlay from "./component-overlay.vue"
import type { IDesignComponentOverlay, IDesignComponentPageSize, IDesignRendererContext } from "@vue-cook/core";
const props = defineProps<{
    enablePicker: boolean,
    size: IDesignComponentPageSize,
    rendererContext?: IDesignRendererContext
}>()
const { enablePicker, size, rendererContext } = toRefs(props)
const handleMouseMove = (e: MouseEvent) => {
    if (enablePicker.value && rendererContext?.value) {
        overlay.value = rendererContext.value.getComponetnOverlay({
            size: size.value,
            eventX: e.x,
            eventY: e.y
        })
    }

}
const handleMouseLeave = () => {
    overlay.value = undefined;
}
const handleDragOver = (e: DragEvent) => {
    // const rect = iframeRef?.value?.getBoundingClientRect()
    // if (rect) {
    //     const el = iframeRef?.value?.contentWindow?.document.elementFromPoint((e.x - rect.x) / size.value.scale * 100, (e.y - rect.y) / size.value.scale * 100)
    //     const exportData = getCookPlayerExportDataFromWindow(iframeRef?.value?.contentWindow || undefined)
    //     if (exportData && rect && el) {
    //         const componentOverlay = exportData.getComponetnOverlayFromElement(el)
    //         overlay.value = componentOverlay
    //     }
    // }
}
const overlay = ref<IDesignComponentOverlay>()
const width = computed(() => {
    return enablePicker.value ? "100%" : 0
})
const height = computed(() => {
    return enablePicker.value ? "100%" : 0
})

</script>
<style lang="less" scoped>
.component-picker {
    position: absolute;
    width: v-bind(width);
    height: v-bind(height);
    left: 0;
    top: 0;
    z-index: 4;
}
</style>