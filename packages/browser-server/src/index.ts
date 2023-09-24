/// <reference lib="WebWorker" />
declare var self: ServiceWorkerGlobalScope
declare var clients: Clients
export {}
import "process"
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
// vite-node-polyfill?
import { MessageType } from '@vue-cook/core'
import { path } from '@vue-cook/core'

let client: Client | undefined = undefined

self.addEventListener('message', (event) => {
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
const app = new Wayne()

app.use(FileSystem({ path, fs, mime, prefix: '__fs__' }))

app.use((err: any, _req: any, res: any, _next: any) => {
  const sep = '-'.repeat(80)
  res.text([sep, ':: Wayne', sep, `Error: ${err.message}`, err.stack].join('\n'))
})

// take control of uncontrolled clients on first load
// ref: https://web.dev/service-worker-lifecycle/#clientsclaim
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})
// TODO:还差build sw 和 index
