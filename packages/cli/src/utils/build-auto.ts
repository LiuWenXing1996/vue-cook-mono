import { resolve } from 'node:path'
import { outputFile, remove } from 'fs-extra'
import { build } from 'vite'
import { getOutDir, getTempDir } from '@/utils'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import type { IDeepRequiredCookConfig } from '@vue-cook/core'

const buildAuto = async (config: IDeepRequiredCookConfig) => {
  const outDir = resolve(getOutDir(config), './auto')
  const tempDir = resolve(getTempDir(config), './auto')
  await remove(tempDir)

  const autoEntryJs = {
    path: '',
    content: ''
  }
  autoEntryJs.path = resolve(tempDir, `./entry.ts`)
  // TODO:这个地方也要考虑deps的external
  autoEntryJs.content = `
import { autoRunVueApp, path } from '@vue-cook/core'
${
  config.deps.map(dep=>{
    return `import * as ${dep.injectName} from '${dep.name}'`
  })
}

import * as Vue from 'vue'
import * as VueRouter from 'vue-router'

const script = document.currentScript as HTMLScriptElement
const scriptUrl = new URL(script?.src,location.href)

const genAbsoulteUrl = (url: string) => {
  const newUrl =  new URL(url,scriptUrl)
  return newUrl.toString()
}

autoRunVueApp({
  vue:Vue,
  vueRouter:VueRouter,
  depsEntryList: [genAbsoulteUrl('../deps/index.js'), genAbsoulteUrl('../deps/index.css')],
  schemaEntryList: [genAbsoulteUrl('../schema/index.js'), genAbsoulteUrl('../schema/index.css')],
  mountedEl:"#app"
}).then((res)=>{console.log("res",res)})
`
  await outputFile(autoEntryJs.path, autoEntryJs.content)

  await build({
    publicDir: false,
    plugins: [nodePolyfills()],
    build: {
      minify: false,
      outDir: outDir,
      sourcemap: config.sourcemap,
      lib: {
        entry: autoEntryJs.path,
        name: 'auto',
        formats: ['iife'],
        fileName: () => {
          return 'index.js'
        }
      }
    }
  })

  return true
}

export default buildAuto
