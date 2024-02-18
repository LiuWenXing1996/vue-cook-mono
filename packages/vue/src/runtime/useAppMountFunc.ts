import type { Component } from 'vue'
import { createApp as createVueApp } from 'vue'
import App from './app.vue'
import { createRouter, createWebHistory } from 'vue-router'

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
