<script setup lang="ts">
import MonacoEditor from "@/components/monaco-editor/index.vue";
import { computed, onMounted, ref, toRefs } from 'vue';
import { getExtName, getLanguage } from './utils';
import type { IVirtulFileSystem } from "@vue-cook/core";

const props = defineProps<{
    fileName: string,
    vfs: IVirtulFileSystem
}>()
const { fileName, vfs } = toRefs(props)
const content = ref<string>("")
onMounted(async () => {
    content.value = await vfs.value.readFile(fileName.value, "utf-8")
})
const language = computed(() => {
    const extName = getExtName(fileName.value)
    const lang = getLanguage(extName)
    return lang
})
const onValueChange = async (value: string) => {
    await vfs.value.writeFile(fileName.value, value, "utf-8")
}
</script>
<template>
    <div class="file-editor">
        <monaco-editor :value="content" :language="language" @update:value="onValueChange"></monaco-editor>
    </div>
</template>
<style lang="less" >
.file-editor {
    min-height: 100px;
    height: 100%;
}
</style>