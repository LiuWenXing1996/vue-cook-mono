import {
  defineRender,
  defineView as _defineView,
  type IView,
  type IRenderData
} from '@vue-cook/core'
import { createApp, h, type Component, ref } from 'vue'
import App from './App.vue'
export default defineRender((params) => {
  const { mountElementId, data, watchData } = params
  const app = createApp(() => {
    const dataRef = ref<IRenderData>(data)
    watchData((data) => (dataRef.value = data.value))
    return h(App, {
      data
    })
  })
  app.mount(mountElementId)
})

export type IComponentView = IView<Component>

export const defineView = (view: IComponentView) => view
