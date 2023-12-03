<template>
    <template v-if="schema.type === 'Text'">
        {{ text }}
    </template>
</template>
<script setup lang="ts">
import type { ITemplateTextSchema, IViewContext } from '@vue-cook/core';
import { shallowRef, toRefs, watch } from 'vue';
import type { Renderer } from '../renderer';

const props = defineProps<{
    schema: ITemplateTextSchema
    viewContext: IViewContext
    renderer: Renderer,
}>()
const { schema, viewContext, renderer } = toRefs(props)
const viewData = renderer.value.createViewData<string>(viewContext.value)
const text = shallowRef<string | undefined>(viewData.getValue())
viewData.onValueChange(() => {
    text.value = viewData.getValue()
})
watch(schema, () => {
    viewData.setSchema(schema.value.content)
    text.value = viewData.getValue()
}, {
    immediate: true
})



</script>