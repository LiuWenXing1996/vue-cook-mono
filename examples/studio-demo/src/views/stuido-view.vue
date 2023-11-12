<script setup lang="ts">
import { Studio, createStudioState, type IStudioState } from '@vue-cook/ui'
import { path } from '@vue-cook/core'
import { request } from "@/utils/index"
import JSZip from "jszip";
import esbuildWasmUrl from 'esbuild-wasm/esbuild.wasm?url'
import swcWasmUrl from '@swc/wasm-web/wasm-web_bg.wasm?url'
import '@vue-cook/ui/dist/style.css'
import { onMounted, ref } from 'vue';
const studioStateRef = ref<IStudioState>()
onMounted(async () => {
  const studioState = await createStudioState({
    projectName: "vite-single-page-app",
    services: {
      getDesignDepsEntry: async (params) => {
        return await request({
          url: "/api/getDesignDepsEntry",
          params: {
            projectName: params.projectName
          },
        }) as any;
      },
      getRuntimeDepsEntry: async (params) => {
        return await request({
          url: "/api/getRuntimeDepsEntry",
          params: {
            projectName: params.projectName
          },
        }) as any;
      },
      getEsbuildWasmUrl: async () => {
        return esbuildWasmUrl
      },
      getSwcWasmUrl: async () => {
        return swcWasmUrl
      },
      getFiles: async () => {
        const zipFile = await request({
          url: "/api/getZip",
          params: {
            projectName: "vite-single-page-app"
          }, responseType: "arraybuffer"
        }) as any
        const zip = new JSZip();
        const zipData = await zip.loadAsync(zipFile?.data);
        const zipFiles = zipData.files
        const files: {
          path: string;
          content: string;
        }[] = []
        await Promise.all(Object.keys(zipFiles).map(async (filename) => {
          const dest = path.join('./', filename);
          const file = zipFiles[filename]
          if (file.dir) {
            return
          }
          const content = await file.async('string')
          files.push({
            path: dest,
            content
          })
        }))
        return files
      }
    }
  })
  studioStateRef.value = studioState
})
</script>

<template>
  <Studio v-if="studioStateRef" :state="studioStateRef" />
</template>