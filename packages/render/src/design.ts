import { defineDesignRender, type IDesignRenderData } from '@vue-cook/core'
import { createApp, h, type Component, ref } from 'vue'
import App from './App.vue'
export default defineDesignRender<Component>((params) => {
  const { mountElementId, data, watchData } = params
  const app = createApp(
    h(App, {
      data,
      watchData
    })
  )
  app.mount(mountElementId)
})

// TODO:拆分为designRender和runtimeRender？
