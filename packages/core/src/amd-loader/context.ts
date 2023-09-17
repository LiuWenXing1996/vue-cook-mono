import { Module } from './module'
import { type DefineOptions } from './define'
import { v4 as uuidv4 } from 'uuid'
import { extname, normalize } from 'path-browserify'

const getDirname = (path: string) => {
  const newPath = path.substring(0, path.lastIndexOf('/')) || undefined
  return newPath ? mustEndWithSlash(newPath) : './'
}

const isHttpUrl = (url: string) => {
  if (url.startsWith('https://') || url.startsWith('http://')) {
    return true
  }
  return false
}

const mustEndWithSlash = (value: string) => {
  if (value.endsWith('/')) {
    return value
  }
  return value + '/'
}

const contextMap = new Map<string, Context>()
export const getContext = (id: string) => {
  return contextMap.get(id)
}

export type ICallback = Function | Object
export class Context {
  private id: string
  private config: IContextConfig
  moduleMap: Map<string, Module> = new Map()
  private defineOptionsMap: Map<string, DefineOptions> = new Map()
  constructor(config: Partial<IContextConfig>) {
    this.id = uuidv4()
    contextMap.set(this.id, this)
    const injectModules: Record<string, any> = {
      ...config.injectModules
    }

    this.config = {
      waitSeconds: config.waitSeconds == null ? 7 : config.waitSeconds,
      paths: config.paths || {},
      baseUrl: config.baseUrl ? mustEndWithSlash(config.baseUrl) : '',
      injectModules: config.injectModules || {},
      errorCallback: config.errorCallback || (() => {})
    }

    Object.keys(injectModules).map((name) => {
      const module = this.getModule(name, '')
      module.init([], () => {
        return injectModules[name]
      })
    })
  }

  setDefineOptions(url: string, options: DefineOptions) {
    this.defineOptionsMap.set(url, options)
  }

  getDefineOptions(url: string) {
    return this.defineOptionsMap.get(url)
  }

  getId() {
    return this.id
  }

  private nameToUniqUrl(name: string, parentUrl?: string) {
    if (['require', 'exports', 'module'].includes(name)) {
      return name
    }
    // TODO: require exports module name
    if (this.moduleMap.has(name)) {
      return name
    }
    let url = this.config.paths?.[name] || undefined
    const inPaths = this.config.paths?.[name] ? true : false
    let baseUrl = this.config.baseUrl || ''
    if (!inPaths) {
      if (parentUrl) {
        baseUrl = getDirname(parentUrl)
      }
    }
    if (!url) {
      url = name
    }

    if (!isHttpUrl(url)) {
      url = baseUrl + url
    }
    const _extName = extname(url)
    if (!_extName) {
      url = url + '.js'
    }
    url = normalize(url)
    return url
  }

  private getModule(uniqUrl: string, parentUrl: string) {
    if (uniqUrl === 'require') {
      const module = new Module(this, uniqUrl)
      module.init([], () => {
        return (deps: string[], callback: Function, errback?: Function) => {
          this.getDepValues(deps, parentUrl, callback, errback)
        }
      })
      return module
    }
    if (uniqUrl === 'exports') {
      const module = new Module(this, uniqUrl)
      const parentModule = this.getModule(parentUrl, '')
      parentModule.exports = {}
      module.init([], () => {
        return parentModule.exports
      })
      return module
    }
    if (uniqUrl === 'module') {
      const module = new Module(this, uniqUrl)
      const parentModule = this.getModule(parentUrl, '')
      parentModule.exports = {}
      const _module = {
        exports: parentModule.exports
      }
      module.init([], () => {
        return _module
      })
      return module
    }

    let module = this.moduleMap.get(uniqUrl)
    if (!module) {
      module = new Module(this, uniqUrl)
      this.moduleMap.set(uniqUrl, module)
    }
    return module
  }

  getDepValues(depNames: string[], parentUrl: string, callback: Function, errback?: Function) {
    const _errback = () => {
      this.config.errorCallback()
      if (errback) {
        errback()
      }
    }
    const depValues: any[] = []
    const depUrls = depNames.map((depName) => {
      return this.nameToUniqUrl(depName, parentUrl)
    })
    let depsCount = depUrls.length
    const check = () => {
      if (depsCount <= 0) {
        callback(...depValues)
      }
    }
    check()
    depUrls.forEach((depUrl, i) => {
      const module = this.getModule(depUrl, parentUrl)
      module.getExports((e: any) => {
        depsCount = depsCount - 1
        depValues[i] = e
        check()
      }, _errback)
    })
  }
}

export type IContext = Context

export interface IContextConfig {
  waitSeconds: number
  baseUrl: string
  paths: Record<string, string>
  injectModules: Record<string, any>
  errorCallback: Function
}
