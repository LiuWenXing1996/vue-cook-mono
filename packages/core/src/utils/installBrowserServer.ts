import { dirname } from 'path-browserify'
import type { IVirtulFileSystem } from '..'
import { v4 as uuidv4 } from 'uuid'
export const MessageType = '__cook__browser__server__'
export interface IMessageSend<T = any> {
  type: typeof MessageType
  action: 'link-for-sw' | 'link-for-client' | 'call-fs-method'
  data?: T
}

export interface ICallFsMethodData {
  name: string
  args: any[]
}

export interface ICallFsMethodReturns {
  data: any
  error?: any
}

const mustEndWithSlash = (value: string) => {
  if (value.endsWith('/')) {
    return value
  }
  return value + '/'
}

export type IMessageRecived<T = any> = Partial<IMessageSend<T>>

export const installBrowserServer = async (
  swJsUrl: string,
  options: {
    vfs: IVirtulFileSystem
  }
) => {
  const { vfs } = options
  if ('serviceWorker' in navigator) {
    const swJsUrlInstance = new URL(swJsUrl, location.href)
    const scope = mustEndWithSlash(dirname(swJsUrlInstance.toString()))
    const oldRe = await navigator.serviceWorker.getRegistration(scope)
    await oldRe?.unregister()
    await navigator.serviceWorker.register(swJsUrl, { scope })
    const linkMessage: IMessageSend = {
      type: MessageType,
      action: 'link-for-sw'
    }
    navigator.serviceWorker.controller?.postMessage(linkMessage)
    let sw: ServiceWorker | undefined = undefined

    navigator.serviceWorker.addEventListener('message', async (event) => {
      if (event.source === sw) {
        const msg = (event.data || {}) as IMessageRecived
        if (msg.type === MessageType) {
          if (msg.action === 'call-fs-method') {
            const data = (msg as IMessageSend<ICallFsMethodData>).data
            const result: ICallFsMethodReturns = {
              data: undefined
            }
            try {
              // @ts-ignore
              result.data = await vfs[data.name](...data.args)
            } catch (error) {
              result.error = error
            }
            event.ports[0].postMessage(result)
          }
        }
      }
    })

    return new Promise((resolve, reject) => {
      navigator.serviceWorker.addEventListener('message', function handler(event) {
        const data = (event.data || {}) as IMessageRecived
        if (data.type == MessageType) {
          if (data.action === 'link-for-client') {
            sw = event.source as ServiceWorker
            resolve(undefined)
          }
        }
      })
    })
  } else {
    throw new Error('Service workers are not supported.')
  }
}
