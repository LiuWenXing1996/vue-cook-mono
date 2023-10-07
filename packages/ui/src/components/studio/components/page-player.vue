<template>
    <div class="page-player">
        <iframe :src="path" ref="iframeRef"></iframe>
    </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';

defineProps({
    path: {
        type: String,
        required: true
    },
})
const iframeRef = ref<HTMLIFrameElement>()
console.log("iframeRef", iframeRef?.value?.contentWindow)
watch(iframeRef, () => {
    console.log("sddddd", iframeRef?.value?.contentWindow)
})
</script>
<style lang="less">
.page-player {
    position: relative;
    width: 100%;
    height: 100%;

    iframe {
        border: none;
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 2;
    }
}
</style>