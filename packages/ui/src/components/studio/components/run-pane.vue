<script setup lang="ts">
import { build } from "@vue-cook/core"
import { inject } from "vue";
import type { IStudioState } from "../types";
const studioState = inject<IStudioState>('studioState') as IStudioState
const { vfs } = studioState
const a = build({
    env: "browser",
    vfs,

})
</script>
<template>
    <div>ss</div>
</template>

<style lang="less" scoped></style>