import { defineRemotePlugin } from '@vue-cook/core'
import { createApp, h } from 'vue'
import App from './App.vue'
export const dependenciesManager = defineRemotePlugin({
  name: 'dependenciesManager',
  run: (data) => {
    console.log('dependenciesManager run')
    const app = createApp(
      h(App, {
        deps: data.deps,
        config: data.config
      })
    )
    app.mount(data.config.mountedEl)
  }
})
