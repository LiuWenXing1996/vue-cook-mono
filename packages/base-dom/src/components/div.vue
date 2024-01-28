<template>
    <div>
        {{children}}
    </div>
</template>
<script setup lang="ts">
import {h} from "vue"
defineProps<{
    children: 
}>()
</script>