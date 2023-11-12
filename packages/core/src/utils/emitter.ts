import { TinyEmitter } from 'tiny-emitter'

export class Emitter extends TinyEmitter {
  listen(event: string, callback: Function, ctx?: any) {
    if (callback) {
      super.on(event, callback, ctx)
    }
    return () => {
      if (callback) {
        super.off(event, callback)
      }
    }
  }
}
