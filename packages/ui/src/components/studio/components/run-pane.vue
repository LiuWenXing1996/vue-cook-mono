<script setup lang="ts">
import { inject, ref } from "vue";
import type { IStudioState } from "../types";
import { createBuildContext } from "../utils";
import { NButton } from "naive-ui"
import type { IBuildContext } from "@vue-cook/schema-bundler";
const studioState = inject<IStudioState>('studioState') as IStudioState
const { buildContext } = studioState
</script>
<template>
    <n-button @click="() => {

        buildContext?.rebuild()
        console.log(buildContext)
    }">构建</n-button>
</template>

<style lang="less" scoped></style>