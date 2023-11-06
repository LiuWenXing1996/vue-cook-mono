import { AbstractEditorRenderer, type ITemplateConfigWithPid } from '@vue-cook/core'
import {
  createApp,
  h,
  type Component,
  ref,
  type App as IApp,
  type ComponentInternalInstance
} from 'vue'
import App from './app.vue'
export class Renderer extends AbstractEditorRenderer<Component> {
  private app?: IApp<Element>
  elementToTemplateConfigMap = new Map<Element, ITemplateConfigWithPid>()
  templatePidToInstanceMap = new Map<string, ComponentInternalInstance>()
  mount(mountElementId: string): void | Promise<void> {
    this.app = createApp(
      h(App, {
        renderer: this
      })
    )
    this.app.mount(mountElementId)
  }
}

// TODO:拆分为designRender和runtimeRender？
