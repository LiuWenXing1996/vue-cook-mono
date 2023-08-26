import { loadScript } from '../lowcode/loadScript'
import { Context } from './context'
import { TinyEmitter } from 'tiny-emitter'

export class Module {
  private context: Context
  private url: string
  private exports: Object | undefined
  private loading: boolean = false
  private inited: boolean = false
  private exported: boolean = false
  private deps: string[] = []
  private emitter = new TinyEmitter()
  private loadedEventName = 'loaded'
  private factory: Function | undefined
  constructor (context: Context, url: string) {
    this.url = url
    this.context = context
  }
  init (deps: string[], factory: Function) {
    if (this.inited) {
      return
    }
    this.inited = true
    this.deps = [...deps]
    this.factory = factory
  }
  initByLoad (callback: Function) {
    if (this.loading) {
      this.emitter.once(this.loadedEventName, callback)
    }
    this.loading = true
    loadScript(this.url, {
      contextId: this.context.getId()
    }).then(() => {
      const deifneOptions = this.context.getDefineOptions(this.url)
      if (!deifneOptions) {
        return
      }
      this.init(deifneOptions.deps, deifneOptions.callback)
      this.emitter.emit(this.loadedEventName)
    })
  }
  getExports (callback: Function) {
    if (this.exported) {
      callback(this.exports)
    }
    const makeExports = () => {
      const depUrls = this.deps.map(depName => {
        return this.context.nameToUrl(depName, this.url)
      })
      this.context.getDepValues(depUrls, (...depValues: any[]) => {
        const factory = this.factory
        const exports = factory?.(...depValues)
        this.exports = exports
        callback(exports)
      })
    }
    if (!this.inited) {
      this.initByLoad(() => {
        makeExports()
      })
    }
    makeExports()
  }
}
