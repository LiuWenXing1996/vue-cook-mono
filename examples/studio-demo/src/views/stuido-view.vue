<script setup lang="ts">
import { Studio, createStudioState, type IStudioState } from '@vue-cook/ui'
import { path, createVfs } from '@vue-cook/core'
import { request } from "@/utils/index"
import JSZip from "jszip";
import '@vue-cook/ui/dist/style.css'
import { onMounted, ref } from 'vue';
const studioStateRef = ref<IStudioState>()
onMounted(async () => {
  const vfs = createVfs()

  const zipFile = await request({
    url: "/api/getZip", params: {
      projectName: "vite-single-page-app"
    }, responseType: "arraybuffer"
  }) as any
  const zip = new JSZip();
  const zipData = await zip.loadAsync(zipFile?.data);
  const files = zipData.files
  try {
    for (const filename of Object.keys(files)) {
      const dest = path.join('./', filename);
      // 如果该文件为目录需先创建文件夹
      if (files[filename].dir && ! await vfs.exists(dest)) {
        await vfs.mkdir(dest, {
          recursive: true
        });
      } else {
        // 把每个文件buffer写到硬盘中 
        const content = await files[filename].async('nodebuffer')
        await vfs.writeFile(dest, content)
        // .then(content => );
      }
    }
    const studioState = await createStudioState({
      vfs, projectName: "vite-single-page-app", services: {
        getRemotePluginEntry: async (params) => {
          const a = await request({
            url: "/api/getRemotePluginEntry",
            params: {
              projectName: params.projectName
            },
          }) as any
          console.log("a", a)

          return a
        },
        getDesignDepsEntry: async (params) => {
          return await request({
            url: "/api/getDesignDepsEntry",
            params: {
              projectName: params.projectName
            },
          }) as any
        },
        getRuntimeDepsEntry: async (params) => {
          return await request({
            url: "/api/getRuntimeDepsEntry",
            params: {
              projectName: params.projectName
            },
          }) as any
        },
      }
    })
    studioStateRef.value = studioState
  } catch (error: any) {
    console.error('save zip files encountered error!', error.message);
    return error;
  }
})
</script>

<template>
  <Studio v-if="studioStateRef" :state="studioStateRef" />
</template>