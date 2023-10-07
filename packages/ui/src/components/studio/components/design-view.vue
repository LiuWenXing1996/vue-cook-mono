<template>
    <div class="design-view">
        <iframe :src="path" ref="iframeRef"></iframe>
    </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
import { emitEditorWindowSchemaChange, type ISchemaData, SchemaChanegeDataType } from "@vue-cook/core"
import { toRenameRefs } from '@/utils/toRenameRefs';
const props = defineProps({
    path: {
        type: String,
        required: true
    },
    schemaData: {
        type: Object as () => ISchemaData | undefined,
        required: true
    }
})
const { schemaDataRef } = toRenameRefs(props)
const iframeRef = ref<HTMLIFrameElement>()
watch(schemaDataRef, () => {
    if (iframeRef?.value?.contentWindow && schemaDataRef.value) {
        emitEditorWindowSchemaChange(iframeRef?.value?.contentWindow, {
            type: SchemaChanegeDataType,
            data: JSON.parse(JSON.stringify(schemaDataRef.value))
        })
    }
})
</script>
<style lang="less">
.design-view {
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