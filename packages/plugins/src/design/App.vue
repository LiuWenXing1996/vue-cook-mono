<template>
  <n-message-provider>
    <DepsTable :deps="deps" :config="config"></DepsTable>
  </n-message-provider>
</template>

<script lang="ts" setup>
import type { IDeps, IRunRemotePluginConfig } from '@vue-cook/core';
import { NMessageProvider } from "naive-ui"
import DepsTable from "./components/DepsTable.vue"

defineProps({
  deps: {
    type: Object as () => IDeps,
    required: true
  },
  config: {
    type: Object as () => IRunRemotePluginConfig,
    required: true
  },
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  height: 100vh;
}
</style>
