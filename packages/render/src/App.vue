<template>
    <ComponentRender :config="componentSchemaConfig" :dev="data.dev" :render-mode="data.renderMode" :view-map="viewMap"
        :editor-map="editorMap"></ComponentRender>
</template>
<script setup lang="ts">
import { type IComponentSchemaConfig, type IRenderData, getViewList, type IView, type IEditor } from '@vue-cook/core';
import ComponentRender from './components//ComponentRender.vue';
import { ref, toRefs, type Component, shallowRef, onMounted, watch } from 'vue';
import type { IDeps } from '@vue-cook/core';
const props = defineProps<{
    data: IRenderData,
    deps: IDeps
}>()
const { data,deps } = toRefs(props)

const componentSchemaConfig = shallowRef<IComponentSchemaConfig | undefined>(data.value.schemaData)
const viewMap = ref<Map<string, IView<Component>>>(new Map())
const editorMap = ref<Map<string, IEditor>>(new Map())

watch(data, () => {
    const viewList = getViewList<Component>({
        deps: data.value.deps
    })
    viewList.map(e => {
        // TODO:注册view
        // componentMap.value.set()
    })
})

onMounted(async () => {
    const viewList = await getViewList<Component>({
        deps: data.value.deps
    })
    viewList.map(e => {
        // TODO:注册view
        // componentMap.value.set()
    })
})


data.value.watchSchemaData((data) => {
    componentSchemaConfig.value = data.schemaData
})

</script>