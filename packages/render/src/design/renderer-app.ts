import {
  AbstractRendererApp,
  type IPageViewSchema,
  type ITemplateTreeSchemaNode,
  type IViewOverlay
} from '@vue-cook/core'
import { createApp, h, type Component, type ComponentInternalInstance } from 'vue'
import App from './app.vue'
import Preview from './preview.vue'
import getComponentRect from './utils/getComponentRect'
import type { Renderer } from './renderer'
import { createRouter, createWebHistory } from 'vue-router'

export class RendererApp extends AbstractRendererApp<Component, Renderer> {
  elementToTreeSchemaNodeMap = new Map<Element, ITemplateTreeSchemaNode>()
  templateTreeSchemaNodeIdToInstanceMap = new Map<string, ComponentInternalInstance>()
  getViewOverlayFromElement(element: Element): IViewOverlay | undefined {
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
    const overlay: IViewOverlay = {
      rect: rect,
      templateSchema: node.content
    }
    return overlay
  }
  mount(mountElementId: string) {
    const app = createApp(App)
    const renderer = this.renderer
    const lowcodeContext = renderer.getLowcodeContext()
    const runResult = lowcodeContext.getRunResult()
    if (!runResult) {
      throw new Error('undefined runResult')
    }
    const { schemaList } = runResult
    schemaList.map((e) => {
      e.content.type
    })
    const pageSchemaList = schemaList.filter((e) => {
      return e.content.type === 'Page'
    }) as {
      path: string
      content: IPageViewSchema
    }[]
    const router = createRouter({
      history: createWebHistory(import.meta.env.BASE_URL),
      routes: pageSchemaList.map((e) => {
        return {
          path: e.content.router.path,
          component: renderer.transferView(e)
        }
      })
    })
    app.use(router)
    app.mount(mountElementId)
  }
  preview(mountElementId: string, viewFilePath: string) {
    const app = createApp(
      h(Preview, {
        rendererApp: this,
        mainViewFilePath: viewFilePath
      })
    )
    app.mount(mountElementId)
  }
}
