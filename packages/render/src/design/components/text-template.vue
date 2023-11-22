<template>
    <template v-if="schema.type === 'Text'">
        {{ text }}
    </template>
</template>
<script setup lang="ts">
import type { ITemplateTextSchema } from '@vue-cook/core';
import { computed, toRefs } from 'vue';
import type { Renderer } from '../renderer';

const props = defineProps<{
    schema: ITemplateTextSchema
    states: Record<string, any>,
    renderer: Renderer,
}>()
const { schema, states, renderer } = toRefs(props)
const text = computed(() => {
    const textSchema = schema.value.content
    return renderer.value.transferAttribute(textSchema, {
        states: states.value,
        i18ns: []
    })
})

</script>
<style lang="less" scoped></style>