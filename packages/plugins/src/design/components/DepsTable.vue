<template>
    <n-data-table :columns="columns" :data="data" size="small" :pagination="false" :bordered="false" />
</template>
  
<script lang="ts" setup>
import { toRefs, computed } from 'vue'
import { NDataTable } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import type { IDeps, IRunRemotePluginConfig } from '@vue-cook/core';
export type IDepItem = {
    name: string
    version: string
}

const props = defineProps({
    deps: {
        type: Object as () => IDeps,
        required: true
    },
    config: {
        type: Object as () => IRunRemotePluginConfig,
        required: true
    },
})

const { deps, config } = toRefs(props)
const columns = computed<DataTableColumns<IDepItem>>(() => {
    return [
        {
            title: '名称',
            key: 'name'
        },
        {
            title: '版本',
            key: 'version'
        },
    ]
})

const data = computed<IDepItem[]>(() => {
    const list: IDepItem[] = []
    deps.value.forEach(e => {
        list.push({
            name: e.meta.name,
            version: e.meta.version || ""
        })
    })
    return list
})
</script>