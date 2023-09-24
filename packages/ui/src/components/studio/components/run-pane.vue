<script setup lang="ts">
import { type IBuildContext } from "@vue-cook/core"
import { inject, ref } from "vue";
import type { IStudioState } from "../types";
import { createBuildContext } from "../utils";
import { NButton } from "naive-ui"
const studioState = inject<IStudioState>('studioState') as IStudioState
const { vfs } = studioState
const ctx = ref<IBuildContext>()
createBuildContext({ vfs }).then(res => {
    ctx.value = res
})
</script>
<template>
    <n-button @click="() => { ctx?.rebuild() }">构建</n-button>
</template>

<style lang="less" scoped></style>