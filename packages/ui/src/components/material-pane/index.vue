<template>
    <div class="material-pane">
        <n-data-table :columns="columns" :data="data" size="small" :pagination="false" :bordered="false" />
    </div>
</template>
<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue';
import { NDataTable } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { type IMaterialWithDep, getMaterialList } from "@vue-cook/core"
import { useInjectSudioState } from "@/hooks/useInjectStudioState";
const { services, projectName } = useInjectSudioState()

const materials = shallowRef<IMaterialWithDep[]>([])
onMounted(async () => {
    const designDepsEntry = await services.value.getDesignDepsEntry({
        projectName: projectName.value
    })
    const list = await getMaterialList({
        depsEntry: designDepsEntry
    })
    materials.value = list
})
export type IDepItem = {
    name: string
    version: string
}

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
    materials.value.forEach(e => {

        list.push({
            name: e.material.name,
            version: e.dep.meta.version || ""
        })
    })
    return list
})

</script>
<style lang="less" >
.material-pane {
    width: 100%;
    height: 100%;
}
</style>