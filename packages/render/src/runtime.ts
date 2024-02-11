import { bindAction, defineViewContext, type IAction } from '@vue-cook/core'
import { shallowReactive, shallowRef, watch } from 'vue'
import type { ShallowRef, Raw, Component } from 'vue'
import { createApp as createVueApp } from 'vue'
import App from './app.vue'
import { createRouter, createWebHistory } from 'vue-router'

// TODO:这个丑陋的实现要改一改
export const useViewContext = <C extends ReturnType<typeof defineViewContext>>(
  setup: C
): {
  states: ShallowRef<ReturnType<ReturnType<C>['states']['getAll']>>
  actions: ShallowRef<ReturnType<ReturnType<C>['actions']['getAll']>>
} => {
  const ctx = setup()

  const statesRef = shallowRef(ctx.states.getAll())
  const actionsRef = shallowRef(ctx.actions.getAll())

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
