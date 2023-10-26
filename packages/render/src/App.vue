<template>
    <ComponentRender :config="componentSchemaConfig" :dev="data.dev" :render-mode="data.renderMode" :var-map="varMap"
        :component-map="componentMap"></ComponentRender>
</template>
<script setup lang="ts">
import { type IComponentSchemaConfig, type IRenderData, type IView, type IEditor } from '@vue-cook/core';
import ComponentRender from './components//ComponentRender.vue';
import { ref, toRefs, type Component, shallowRef, onMounted, watch } from 'vue';
import type { IDeps } from '@vue-cook/core';
import { getComponetMap } from '@vue-cook/core';
const props = defineProps<{
    data: IRenderData,
    deps: IDeps
}>()
const { data, deps } = toRefs(props)

const componentSchemaConfig = shallowRef<IComponentSchemaConfig | undefined>(data.value.schemaData)
const componentMap = shallowRef<Map<string, Component>>(new Map())
const varMap = shallowRef<Map<string, IView<Component>>>(new Map())

watch(data, (value) => {
    const schemaData = value.schemaData
    componentSchemaConfig.value = schemaData
    componentMap.value = getComponetMap({
        deps: deps.value,
        componentConfig: schemaData
    })
})
</script>