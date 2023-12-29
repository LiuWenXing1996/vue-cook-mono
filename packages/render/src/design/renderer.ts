import { AbstractRenderer, type IRendererApp, type IViewFileSchema } from '@vue-cook/core'
import { RendererApp } from './renderer-app'
import { type Component, defineComponent, h } from 'vue'
import ViewRender from './components/view-render.vue'
export class Renderer extends AbstractRenderer {
  createApp(): IRendererApp {
    return new RendererApp({ renderer: this })
  }
  transferView(schema: IViewFileSchema): Component {
    const { template } = schema.content
    // TODO:实现transferView
    return defineComponent((props, ctx) => {
      return () => {
        // 渲染函数或 JSX
        return h(ViewRender, props)
      }
    })
  }
}
