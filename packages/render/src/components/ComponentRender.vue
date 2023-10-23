<template>
    <template-render v-for="tConfig in config?.template" :config="tConfig" :dev="dev" :render-mode="renderMode"
        :view-map="viewMap" :editor-map="editorMap" />
</template>
<script setup lang="ts">
import { type Component } from "vue";
import { type IComponentSchemaConfig, type IEditor, type IRenderMode, type IView } from "@vue-cook/core"
import TemplateRender from "./TemplateRender.vue";
defineProps<{
    config?: IComponentSchemaConfig,
    viewMap: Map<string, IView<Component>>,
    editorMap: Map<string, IEditor>,
    renderMode: IRenderMode,
    dev: boolean
}>()

</script>