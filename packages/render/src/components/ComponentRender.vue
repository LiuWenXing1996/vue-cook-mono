<template>
    <template-render v-for="tConfig in config?.template" :config="tConfig" :dev="dev" :component-map="componentMap"
        :var-map="varMap" />
</template>
<script setup lang="ts">
import { type Component } from "vue";
import { type IComponentSchemaConfig, type IEditor, type IRenderMode, type IView } from "@vue-cook/core"
import TemplateRender from "./TemplateRender.vue";
defineProps<{
    config?: IComponentSchemaConfig,
    varMap: Map<string, any>,
    componentMap: Map<string, Component>,
    dev: boolean
}>()

</script>