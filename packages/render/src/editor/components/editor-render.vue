<template>
    <template-render v-for="tConfig in config?.template" :config="tConfig" :component-map="componentMap"
        :state-map="stateMap" :renderer="renderer" />
</template>
<script setup lang="ts">
import { type Component, type ComponentInternalInstance } from "vue";
import { type IComponentConfigWithTemplatePid, type IComponentMap, type IStateMap } from "@vue-cook/core"
import TemplateRender from "./template-render.vue";
import type { Renderer } from "../renderer";
defineProps<{
    config?: IComponentConfigWithTemplatePid,
    stateMap: IStateMap,
    componentMap: IComponentMap<Component>,
    renderer: Renderer
}>()

</script>