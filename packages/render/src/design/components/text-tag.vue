<template>
    {{ content }}
</template>
<script setup lang="ts">
defineProps<{
    content: string
}>()
</script>