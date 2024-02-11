import { Renderer } from './design/renderer'
export { Renderer as EditorRenderer } from './design/renderer'

export default Renderer

export const DesignRenderer = Renderer

import { bindAction, defineContext, type IAction, Context } from '@vue-cook/core'
import { shallowReactive, shallowRef, watch } from 'vue'
import type { ShallowRef, Raw, Component } from 'vue'
import { createApp as createVueApp } from 'vue'
import App from './app.vue'
import { createRouter, createWebHistory } from 'vue-router'

// TODO:这个丑陋的实现要改一改
export const useViewContext = <C extends ReturnType<typeof defineContext>>(
  options: C
): {
  states: ShallowRef<ReturnType<C['states']>>
  actions: ShallowRef<ReturnType<C['actions']>>
} => {
  const ctx = new Context(options)

  const statesRef = shallowRef(ctx.getAllStates())
  const actionsRef = shallowRef(ctx.getAllActions())

  ctx.watchAllStates((data) => {
    statesRef.value = { ...data }
  })

  ctx.watchAllActions((data) => {
    actionsRef.value = { ...data }
  })

  return {
    // @ts-ignore
    states: statesRef,
    // @ts-ignore
    actions: actionsRef
  }
}
export const useAppMountFunc = (params: {
  pages: Component &
    {
      router: {
        path: string
      }
    }[]
}) => {
  const { pages } = params
  const appMount = (options: { routerBase: string; contaienr: HTMLElement | string }) => {
    const { routerBase, contaienr } = options
    const app = createVueApp(App)
    const router = createRouter({
      history: createWebHistory(routerBase),
      routes: pages.map((e) => {
        return {
          path: e.router.path,
          component: e
        }
      })
    })
    app.use(router)
    app.mount(contaienr)
  }
  return appMount
}
export {}
