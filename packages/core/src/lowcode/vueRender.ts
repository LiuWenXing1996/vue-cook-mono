import { createLowcodeContext, type ILowcodeContextConfig } from '.'
import type * as Vue from 'vue'
import * as VueRouter from 'vue-router'

export type IVue = typeof Vue
export type IVueRouter = typeof VueRouter

export interface IVueRenderContextConfig
  extends Pick<ILowcodeContextConfig, 'depsEntryList' | 'schemaEntryList' | 'dev'> {
  vue: IVue
  vueRouter: IVueRouter
  routerBase?: string
  componentDevPath?: string
}

export interface ILowcodeVueData {
  Pages?: Record<
    string,
    Vue.Component & {
      path: string
    }
  >
  Components?: Record<string, Vue.Component>
}

export const createVueRenderContext = async (config: IVueRenderContextConfig) => {
  const { vue, vueRouter, routerBase, dev } = config
  const componentDevPath = config.componentDevPath || '/componentDev'
  const { ref, createApp, h, defineComponent, computed } = vue
  const { createRouter, createWebHistory, RouterView } = vueRouter
  const lowcodeDataRef = ref<ILowcodeVueData>()
  const lowcodeContextConfig: ILowcodeContextConfig<ILowcodeVueData> = {
    ...config,
    externalLibs: {
      vue: vue,
      'vue-router': vueRouter
    },
    onDataChange: (data) => {
      lowcodeDataRef.value = data
    }
  }
  const lowcodeContext = await createLowcodeContext<ILowcodeVueData>(lowcodeContextConfig)
  const router = createRouter({
    history: createWebHistory(routerBase),
    routes: []
  })
  lowcodeDataRef.value = lowcodeContext.getSchemaData()
  {
    let { Pages = {} } = lowcodeDataRef.value || {}
    Pages = Pages || {}
    Object.keys(Pages).map((pageName) => {
      const page = Pages[pageName]
      router.addRoute({
        path: page.path,
        component: defineComponent((props) => {
          const pageRef = computed(() => {
            let { Pages } = lowcodeDataRef.value || {}
            Pages = Pages || {}
            return Pages[pageName]
          })
          return () => h(pageRef.value, props)
        })
      })
    })
  }

  if (dev) {
    {
      let { Components = {} } = lowcodeDataRef.value || {}
      Components = Components || {}
      Object.keys(Components).map((componentName) => {
        router.addRoute({
          path: `${componentDevPath}/:${componentName}`,
          props: true,
          component: defineComponent((props) => {
            const { componentName } = props
            const componentRef = computed(() => {
              let { Components } = lowcodeDataRef.value || {}
              Components = Components || {}
              return Components[componentName]
            })
            return () => h(componentRef.value, props)
          })
        })
      })
    }
  }
  const app = createApp(h(RouterView))
  app.use(router)
  return {
    ...lowcodeContext,
    app
  }
}

export interface IAutoRunVueAppConfig extends IVueRenderContextConfig {
  mountedEl: string
}

export const autoRunVueApp = async (config: IAutoRunVueAppConfig) => {
  const script = document.currentScript
  const configVarName = script?.dataset?.configVarName || ''
  if (configVarName) {
    // @ts-ignore
    const _config = window[configVarName] as IAutoRunVueAppConfig
    config = {
      ...config,
      ..._config
    }
  }
  const context = await createVueRenderContext(config)
  context.app.mount(config.mountedEl || '#app')
}
