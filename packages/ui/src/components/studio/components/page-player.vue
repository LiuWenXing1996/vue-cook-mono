<template>
    <div class="page-player">
        <iframe :src="path" ref="iframeRef"></iframe>
    </div>
</template>
<script setup lang="ts">
defineProps({
    path: {
        type: String,
        required: true
    },
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