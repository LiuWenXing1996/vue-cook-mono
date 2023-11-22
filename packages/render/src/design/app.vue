<template>
    <template v-if="schema">
        <component-render :renderer="renderer" :schema="schema">
        </component-render>
    </template>
</template>
<script setup lang="ts">
import { computed, shallowRef, toRefs } from 'vue';
import ComponentRender from './components/component-render.vue';
import { type Renderer } from './renderer';
const props = defineProps<{
    renderer: Renderer,
    mainViewFilePath: string
}>()
const { renderer, mainViewFilePath } = toRefs(props)
const getMainSchema = () => {
    const runResult = renderer.value.getLowcodeRunResult()
    const { schemaList = [] } = runResult || {}
    return schemaList.find(e => e.path === mainViewFilePath.value)
}
const schema = shallowRef(getMainSchema())

renderer.value.onLowcodeRunResultChange(() => {
    schema.value = getMainSchema()
})


</script>