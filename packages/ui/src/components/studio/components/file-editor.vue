<script setup lang="ts">
import MonacoEditor from "./monaco-editor.vue";
import { computed, toRefs } from 'vue';
import { getExtName, getLanguage } from '../utils';
const props = defineProps<{
    value: string,
    name: string,
}>()
const emits = defineEmits<{
    (e: 'update:value', value: string): void
}>()
const { value, name } = toRefs(props)
const language = computed(() => {
    const extName = getExtName(name.value)
    const lang = getLanguage(extName)
    return lang
})
const onValueChange = (value: string) => {
    emits("update:value", value)
}

</script>
<template>
    <monaco-editor :value="value" :language="language" @update:value="onValueChange"></monaco-editor>
</template>
<style lang="less" scoped>
.editor {
    min-height: 100px;
    height: 100%;
}
</style>