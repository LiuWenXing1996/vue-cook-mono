<template>
    <template-render v-for="tConfig in config?.template" :config="tConfig" :component-map="componentMap"
        :state-map="stateMap" />
</template>
<script setup lang="ts">
import { type Component } from "vue";
import { type IComponentMap, type IComponentSchemaConfig, type IEditor, type IRenderMode, type IStateMap, type IView } from "@vue-cook/core"
import TemplateRender from "./TemplateRender.vue";
defineProps<{
    config?: IComponentSchemaConfig,
    stateMap: IStateMap,
    componentMap: IComponentMap<Component>,
}>()

</script>