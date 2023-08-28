import { loadScript } from '../lowcode/loadScript'
import { Context } from './context'
import { TinyEmitter } from 'tiny-emitter'
import { v4 as uuidv4 } from 'uuid'

export class Module {
  private context: Context
  private uniqUrl: string
  exports: Object | undefined
  private loading: boolean = false
  private inited: boolean = false
  private exported: boolean = false
  private deps: string[] = []
  private emitter = new TinyEmitter()
  private loadedEventName = 'loaded'
  private factory: Function | undefined
  constructor (context: Context, uniqUrl: string) {
    this.uniqUrl = uniqUrl
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
  initByLoad (callback: Function, errback: Function) {
    if (this.loading) {
      this.emitter.once(this.loadedEventName, callback)
    }
    this.loading = true
    loadScript(this.uniqUrl, {
      contextId: this.context.getId(),
      moduleUrl: this.uniqUrl
    })
      .then(() => {
        const deifneOptions = this.context.getDefineOptions(this.uniqUrl)
        if (!deifneOptions) {
          return
        }
        this.init(deifneOptions.deps, deifneOptions.callback)
        callback()
        this.emitter.emit(this.loadedEventName)
      })
      .catch(err => {
        errback(err)
      })
  }
  getExports (callback: Function, errback: Function) {
    if (this.exported) {
      callback(this.exports)
    }
    const makeExports = () => {
      this.context.getDepValues(
        this.deps,
        this.uniqUrl,
        (...depValues: any[]) => {
          const factory = this.factory
          const exports = factory?.(...depValues)
          if (!this.deps.includes('exports')) {
            this.exports = exports
          }
          this.exported = true
          callback(this.exports)
        },
        errback
      )
    }
    if (!this.inited) {
      this.initByLoad(() => {
        makeExports()
      }, errback)
    } else {
      makeExports()
    }
  }
}
