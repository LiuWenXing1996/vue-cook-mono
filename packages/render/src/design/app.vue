<template>
    <component-render :config="componentSchemaConfig" :state-map="stateMap" :component-map="componentMap"
        :renderer="renderer">
    </component-render>
</template>
<script setup lang="ts">
import { type IComponentConfigWithTemplatePid } from '@vue-cook/core';
import ComponentRender from './components/component-render.vue';
import { ref, toRefs, type Component, shallowRef } from 'vue';
import type { IComponentMap, IStateMap } from '@vue-cook/core';
import { type Renderer } from './renderer';
const props = defineProps<{
    renderer: Renderer
}>()

const { renderer: rendererRef } = toRefs(props)
const renderer = rendererRef.value
const data = renderer.getData()

const componentSchemaConfig = shallowRef<IComponentConfigWithTemplatePid | undefined>(data?.mainComponentConfig)
const componentMap = shallowRef<IComponentMap<Component>>(data?.componentMap || new Map())
const stateMap = shallowRef<IStateMap>(data?.stateMap || new Map())

renderer.watchData((data) => {
    componentSchemaConfig.value = data?.mainComponentConfig
    componentMap.value = data?.componentMap || new Map()
    stateMap.value = data?.stateMap || new Map()
})

</script>