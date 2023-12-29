<template>
    <template v-if="schema">
        <view-render :renderer-app="rendererApp" :schema="schema">
        </view-render>
    </template>
</template>
<script setup lang="ts">
import { shallowRef, toRefs } from 'vue';
import ViewRender from './components/view-render.vue';
import type { RendererApp } from './renderer-app';
const props = defineProps<{
    rendererApp: RendererApp,
    mainViewFilePath: string
}>()
const { rendererApp, mainViewFilePath } = toRefs(props)
const renderer = rendererApp.value.renderer;
const lowcodeContext = renderer.getLowcodeContext()
const getMainSchema = () => {
    const runResult = lowcodeContext.getRunResult()
    const { schemaList = [] } = runResult || {}
    return schemaList.find(e => e.path === mainViewFilePath.value)
}
const schema = shallowRef(getMainSchema())

lowcodeContext.onRunResultChange(() => {
    schema.value = getMainSchema()
})
</script>