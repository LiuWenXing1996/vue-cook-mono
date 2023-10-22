import { defineRender, defineView as _defineView, type IView } from '@vue-cook/core'
import { createApp, h, type Component } from 'vue'
import App from './App.vue'
export default defineRender((data) => {
  console.log(document)
  const { mountElementId } = data
  const app = createApp(
    h(App, {
      data
    })
  )
  app.mount(mountElementId)
})

export type IComponentView = IView<Component>

export const defineView = (view: IComponentView) => view
