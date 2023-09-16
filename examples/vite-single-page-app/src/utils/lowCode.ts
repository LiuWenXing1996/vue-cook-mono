import { runContainer } from '@vue-cook/core'
import type { Router } from 'vue-router'
import * as vurRouter from 'vue-router'
import * as vue from 'vue'
import * as vueCookCore from '@vue-cook/core'

let getPromise: Promise<any>

export const getLowCodeRes = async () => {
  if (!getPromise) {
    getPromise = runContainer({
      assets: '/lowcode/schema/entry.js',
      contextConfig: {
        injectModules: {
          vue: vue,
          'vue-router': vurRouter,
          '@vue-cook/core': vueCookCore
        }
        // paths: {
        //   vue: '/lowcode/deps/vue/entry.js',
        //   'vue-router': '/lowcode/deps/vue-router/entry.js',
        //   '@vue-cook/core': '/lowcode/deps/@vue-cook+core/entry.js'
        // }
      }
    })
  }
  return await getPromise
}

export function addLowcodePages (router: Router) {
  let redirectTag = false
  router.beforeEach(async (to, from) => {
    if (!redirectTag) {
      const res = await getLowCodeRes()
      let { Pages } = res || {}
      Pages = Pages || {}
      console.log('pages', Pages)
      Object.keys(Pages).map(pageName => {
        const page = Pages[pageName]
        router.addRoute({
          path: page.path,
          component: page
        })
      })
      redirectTag = true
      return to.fullPath
    }
    redirectTag = false
  })
}
