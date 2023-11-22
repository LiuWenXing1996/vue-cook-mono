import {
  AbstractDesignRenderer,
  type IDesignComponentOverlay,
  type ITemplateTreeSchemaNode
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
import type { IComponentViewSchema } from '@vue-cook/core/dist/schema/view'
export class Renderer extends AbstractDesignRenderer<Component> {
  transferComponent(schema: IComponentViewSchema): Component {
    throw new Error('Method not implemented.')
  }
  private app?: IApp<Element>
  elementToTreeSchemaNodeMap = new Map<Element, ITemplateTreeSchemaNode>()
  templateTreeSchemaNodeIdToInstanceMap = new Map<string, ComponentInternalInstance>()
  mount(mountElementId: string, mainViewFilePath: string): void | Promise<void> {
    this.app = createApp(
      h(App, {
        renderer: this,
        mainViewFilePath
      })
    )
    this.app.mount(mountElementId)
  }
  getComponetnOverlayFromElement(element: Element): IDesignComponentOverlay | undefined {
    let currentEl: Element | null = element
    let node: ITemplateTreeSchemaNode | undefined = undefined
    while (currentEl) {
      node = this.elementToTreeSchemaNodeMap.get(currentEl)
      if (node) {
        break
      }
      currentEl = currentEl.parentElement
    }
    if (!node) {
      return
    }
    const componentInstance = this.templateTreeSchemaNodeIdToInstanceMap.get(node.id)
    if (!componentInstance) {
      return
    }
    const rect = getComponentRect(componentInstance)
    const overlay: IDesignComponentOverlay = {
      rect: rect,
      templateSchema: node.content
    }
    return overlay
  }
}

// TODO:拆分为designRender和runtimeRender？
