<template>
    <ComponentRender :config="componentSchemaConfig" :component-map="componentMap"></ComponentRender>
</template>
<script setup lang="ts">
import { type IComponentSchemaConfig, type IRenderData, getViewList } from '@vue-cook/core';
import ComponentRender from './components//ComponentRender.vue';
import { ref, toRefs, type Component, shallowRef, onMounted } from 'vue';
const props = defineProps<{
    data: IRenderData
}>()
const { data } = toRefs(props)

const componentSchemaConfig = shallowRef<IComponentSchemaConfig | undefined>(data.value.schemaData)
const componentMap = ref<Map<string, Component>>(new Map())

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
<style lang="less" scoped></style>