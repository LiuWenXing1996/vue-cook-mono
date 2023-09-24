<script setup lang="ts">
import { Studio, createStudioState } from '@vue-cook/ui'
import { request } from "@/utils/index"
import JSZip from "jszip";
import '@vue-cook/ui/dist/style.css'
import browserServerJsUrl from "@vue-cook/browser-server/dist/index.js?url"
const studioState = createStudioState({
  browserServerJsUrl
})
const { vfs, path } = studioState
request({ url: "/api/getZip", responseType: "arraybuffer" }).then(async res => {
  // debugger
  const zip = new JSZip();
  const zipData = await zip.loadAsync(res?.data);
  console.log(zipData)

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
    // console.log("sssfsfdf", vfs.getVoulme().toTree())
  } catch (error) {
    console.error('save zip files encountered error!', error.message);
    return error;
  }
})

</script>

<template>
  <Studio :state="studioState" />
</template>