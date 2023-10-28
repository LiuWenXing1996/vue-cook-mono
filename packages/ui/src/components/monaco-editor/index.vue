<script setup lang="ts">
import useMonaco from './utils';
import type * as IMonaco from "monaco-editor";
import { onMounted, ref, toRefs, watch } from 'vue';
const editorContainerRef = ref<HTMLDivElement>()
const monaco = useMonaco()
const props = defineProps<{
    value: string,
    language: string
}>()
const { value, language } = toRefs(props)

const emits = defineEmits<{
    (e: 'update:value', value: string): void
}>()

let editor: IMonaco.editor.IStandaloneCodeEditor | undefined = undefined;

onMounted(() => {
    if (editorContainerRef.value) {
        setTimeout(() => {
            if (editorContainerRef.value) {
                editor = monaco.editor.create(editorContainerRef.value, {
                    value: value.value,
                    language: language.value
                });
                editor.onDidChangeModelContent(() => {
                    const value = editor?.getValue();
                    emits("update:value", value || "")
                });
            }
        })
    }

})
watch(value, (value) => {
    if (!editor) {
        return
    }
    const oldValue = editor?.getValue();
    if (value !== oldValue) {
        editor.setValue(value)
    }
})
watch(language, (language) => {
    if (!editor) {
        return
    }
    const editorModel = editor.getModel()
    if (editorModel) {
        monaco.editor.setModelLanguage(editorModel, language)
    }
})
</script>
<template>
    <div ref="editorContainerRef" class="monaco-editor"></div>
</template>
<style lang="less" >
.monaco-editor {
    min-height: 100px;
    height: 100%;
}
</style>