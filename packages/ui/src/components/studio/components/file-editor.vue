<script setup lang="ts">
import MonacoEditor from "./monaco-editor.vue";
import { computed, inject, onMounted, ref, toRefs } from 'vue';
import { getExtName, getLanguage } from '../utils';
import type { IStudioState } from "../types";

const studioState = inject<IStudioState>('studioState') as IStudioState

const { vfs } = studioState

const props = defineProps<{
    name: string,
}>()
const emits = defineEmits<{
    (e: 'update:value', value: string): void
}>()
const { name } = toRefs(props)
const content = ref<string>("")
onMounted(async () => {
    content.value = await vfs.readFile(name.value, "utf-8")
})
const language = computed(() => {
    const extName = getExtName(name.value)
    const lang = getLanguage(extName)
    return lang
})
const onValueChange = async (value: string) => {
    await vfs.writeFile(name.value, value, "utf-8")
}

</script>
<template>
    <monaco-editor :value="content" :language="language" @update:value="onValueChange"></monaco-editor>
</template>
<style lang="less" scoped>
.editor {
    min-height: 100px;
    height: 100%;
}
</style>