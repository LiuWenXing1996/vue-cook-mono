<template>
    <n-tabs v-model:value="name" type="card" closable tab-style="min-width: 80px;" @close="handleClose">
        <n-tab-pane v-for="panel in panels" :key="panel" :tab="panel.toString()" :name="panel">
            {{ panel }}
        </n-tab-pane>
    </n-tabs>
</template>
  
<script lang="ts" setup>
import { defineComponent, ref } from 'vue'
import { useMessage } from 'naive-ui'
import { NTabs, NTabPane, NEmpty } from "naive-ui";

const name = ref(1)
const panels = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
function handleClose(key: number) {

    const index = panels.value.findIndex((v) => key === v)
    panels.value.splice(index, 1)
    if (name.value === key) {
        name.value = panels.value[index]
    }
}
</script>