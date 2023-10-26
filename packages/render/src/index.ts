import { defineRender, type IRenderData } from '@vue-cook/core'
import { createApp, h, type Component, ref } from 'vue'
import App from './App.vue'
export default defineRender((params) => {
  const { mountElementId, data, watchData, deps } = params
  const app = createApp(() => {
    const dataRef = ref<IRenderData>(data)
    watchData((data) => (dataRef.value = data.value))
    return h(App, {
      data,
      deps
    })
  })
  app.mount(mountElementId)
})

// TODO:拆分为designRender和runtimeRender？
