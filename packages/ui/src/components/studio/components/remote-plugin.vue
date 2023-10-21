<template>
    <div class="remote-plugin">
        <div class="debug-actions">
            <n-button tertiary circle type="warning" @click="refresh">
                <template #icon>
                    <n-icon><cash-icon /></n-icon>
                </template>
            </n-button>
        </div>

        <iframe ref="iframeRef"></iframe>
    </div>
</template>
<script setup lang="ts">
import { useInjectSudioState } from '@/hooks/useInjectStudioState';
import { toRenameRefs } from '@/utils/toRenameRefs';
import { onMounted, ref, toRefs, watch } from 'vue';
import { NButton, NIcon } from "naive-ui"
import { CashOutline as CashIcon } from '@vicons/ionicons5'
import { getRemotePluginPageHtmlString } from '../utils';
const { servicesRef, projectNameRef } = useInjectSudioState()
const services = servicesRef.value
const projectName = projectNameRef.value
const props = defineProps({
    pluginName: {
        type: String,
        required: true
    },
    packageName: {
        type: String,
        required: true
    },
})
const { pluginNameRef, packageNameRef } = toRenameRefs(props)
const pluginName = pluginNameRef.value
const packageName = packageNameRef.value
const iframeRef = ref<HTMLIFrameElement>()
const refresh = async () => {
    // TODO实现刷新
}

watch(iframeRef, async () => {
    if (iframeRef?.value?.contentWindow) {
        const contentWindow = iframeRef?.value?.contentWindow
        const pluginEntry = await services.getRemotePluginEntry({
            projectName
        })
        console.log("pluginEntry", pluginEntry)
        // @ts-ignore
        contentWindow.sss = "ssss"
        contentWindow.document.write(getRemotePluginPageHtmlString({
            pluginName,
            projectName,
            packageName,
            entry: pluginEntry
        }))

    }
})
</script>
<style lang="less">
.remote-plugin {
    position: relative;
    width: 100%;
    height: 100%;

    .debug-actions {
        position: absolute;
        z-index: 3;
    }

    iframe {
        border: none;
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 2;
    }
}
</style>