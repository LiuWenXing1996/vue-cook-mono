<template>
    ssss
    <ComponentRender :config="componentSchemaConfig" :state-map="stateMap" :component-map="componentMap"></ComponentRender>
</template>
<script setup lang="ts">
import { type IComponentSchemaConfig, type IRenderData, type IView, type IEditor, getStateMap } from '@vue-cook/core';
import ComponentRender from './components//ComponentRender.vue';
import { ref, toRefs, type Component, shallowRef, onMounted, watch, computed } from 'vue';
import type { IComponentMap, IDeps, IDesignRenderData, IDesignRenderDataWatch, IStateMap } from '@vue-cook/core';
const props = defineProps<{
    data: IDesignRenderData<Component>,
    watchData: IDesignRenderDataWatch<Component>
}>()
const { data, watchData } = toRefs(props)

const componentSchemaConfig = shallowRef<IComponentSchemaConfig | undefined>(data.value.mainComponentConfig)
const componentMap = shallowRef<IComponentMap<Component>>(new Map())
const stateMap = shallowRef<IStateMap>(new Map())

watchData.value((data) => {
    const { value } = data
    componentSchemaConfig.value = value.mainComponentConfig
    componentMap.value = value.componentMap || new Map()
    stateMap.value = value.stateMap || new Map()
})

</script>