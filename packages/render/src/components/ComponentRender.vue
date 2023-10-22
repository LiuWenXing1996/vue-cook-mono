<template>
    <template-render v-for="tConfig in config?.template" :config="tConfig" :dev="dev" :componentMap="componentMap" />
</template>
<script setup lang="ts">
import { type Component } from "vue";
import { type IComponentSchemaConfig } from "@vue-cook/core"
import TemplateRender from "./TemplateRender.vue";
withDefaults(defineProps<{
    config?: IComponentSchemaConfig,
    componentMap: Map<string, Component>,
    dev?: boolean
}>(), {
    dev: false
})

</script>