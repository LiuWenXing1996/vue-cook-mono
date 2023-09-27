// <reference lib="WebWorker" />
declare var self: ServiceWorkerGlobalScope
declare var clients: Clients
export {}
import 'process'
import { Wayne, FileSystem, type IFs } from './server'
import * as mime from 'mime'
import type {
  ICallFsMethodData,
  ICallFsMethodReturns,
  IMessageRecived,
  IMessageSend
} from '@vue-cook/core'
// TODO:vue-cook似乎还是分开成文件夹，不然server好像还是会打包进一些node的文件
// TODO：另外如果一些其他包也这么引入了，他们岂不是也会打包进一些node资源
// 有没有好的解决方案呢？
// bundler和loader拆分出去是一个更好的方案
// 否则所有引core包的都要装一个import { nodePolyfills } from 'vite-plugin-node-polyfills'
// 这个是不是会引出另外一个问题，在用esbuild打包依赖的时候也会出现一些包的node问题？
// esbuild中有对应的解决方案吗？
// vite-node-polyfill?
import { MessageType } from '@vue-cook/core'
import { path } from '@vue-cook/core'
let client: Client | undefined = undefined
console.log('sw runs')
self.addEventListener('message', (event) => {
  console.log('sw message sss')
  const data = (event.data || {}) as IMessageRecived
  if (data.type == MessageType) {
    if (data.action === 'link-for-sw') {
      client = event.source as Client
      const message: IMessageSend = {
        type: MessageType,
        action: 'link-for-client'
      }
      event.source?.postMessage(message)
    }
  }
})

const callClientFsMethod = async (name: string, args: any[]): Promise<any> => {
  if (!client) {
    throw new Error('client unlinked')
  }
  return new Promise((resolve, reject) => {
    const message: IMessageSend<ICallFsMethodData> = {
      type: MessageType,
      action: 'call-fs-method',
      data: {
        name,
        args
      }
    }
    const channel = new MessageChannel()
    client?.postMessage(message, [channel.port2])
    channel.port1.addEventListener('message', (event) => {
      const data = (event.data || {}) as ICallFsMethodReturns
      if (data.error) {
        reject(data.error)
      } else {
        resolve(data.data)
      }
    })
  })
}

const fs: IFs = {
  readFile: async (...rest) => {
    return await callClientFsMethod('readFile', rest)
  },
  exists: async (...rest) => {
    return await callClientFsMethod('exists', rest)
  },
  isFile: async (...rest) => {
    return await callClientFsMethod('isFile', rest)
  },
  isDirectory: async (...rest) => {
    return await callClientFsMethod('isDirectory', rest)
  },
  readdir: async (...rest) => {
    return await callClientFsMethod('readdir', rest)
  }
}

self.addEventListener('fetch', (event) => {
  // console.log("event.request.url", event.request.url)
  const url = new URL(event.request.url)
  if (!url.pathname.startsWith('/__vfs__file__')) {
    return
  }

  // event.respondWith(new Response('Hello World!'))
  // event.respondWith(new Response('Hello World!'))
  // const promise =
  event.respondWith(
    (async () => {
      // const res = new Response("blob", { status: 200 })
      // resolve(res)
      try {
        // const filePath = url.pathname.substring("/__vfs__file__".length)
        // const ext = path.extname(filePath)
        // const type = mime.getType(ext)
        // const content = await fs.readFile(filePath)
        // const blob = new Blob([content], {
        //   type
        // })
        return new Response('blob')
      } catch (error) {
        console.log('2ssss')
        return new Response('ssss')

      }
    })()
  )
})

// take control of uncontrolled clients on first load
// ref: https://web.dev/service-worker-lifecycle/#clientsclaim
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

self.addEventListener("error", (event) => {
  console.log("error",event)
})

self.addEventListener('install', (event) => {
  console.log("skipWaiting")
  // 每次安装后都使用最新的版本
  self.skipWaiting()
})
