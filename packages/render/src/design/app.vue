<template>
    <component-render :renderer="renderer">
    </component-render>
</template>
<script setup lang="ts">
import ComponentRender from './components/component-render.vue';
import { type Renderer } from './renderer';
defineProps<{
    renderer: Renderer
}>()


</script>