import {
  AbstractDesignRenderer,
  type IComponentOverlay,
  type ITemplateConfigWithPid
} from '@vue-cook/core'
import {
  createApp,
  h,
  type Component,
  ref,
  type App as IApp,
  type ComponentInternalInstance
} from 'vue'
import App from './app.vue'
import getComponentRect from './utils/getComponentRect'
export class Renderer extends AbstractDesignRenderer<Component> {
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
  getComponetnOverlayFromElement(element: Element): IComponentOverlay | undefined {
    let currentEl: Element | null = element
    let currentConfig: ITemplateConfigWithPid | undefined = undefined
    while (currentEl) {
      currentConfig = this.elementToTemplateConfigMap.get(currentEl)
      if (currentConfig) {
        break
      }
      currentEl = currentEl.parentElement
    }
    if (!currentConfig) {
      return
    }
    const componentInstance = this.templatePidToInstanceMap.get(currentConfig.__designPid)
    if (!componentInstance) {
      return
    }
    const rect = getComponentRect(componentInstance)
    const overlay: IComponentOverlay = {
      templateConfig: currentConfig,
      rect: rect
    }
    return overlay
  }
}

// TODO:拆分为designRender和runtimeRender？
